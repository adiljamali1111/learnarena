import { FILE_LIMITS, ALLOWED_FILE_TYPES } from '../constants';

export interface ParsedFile {
  text: string;
  images: string[];
  fileName: string;
  fileType: string;
}

export interface FileParseError {
  fileName: string;
  error: string;
}

export function validateFiles(files: File[]): { valid: File[]; errors: FileParseError[] } {
  const valid: File[] = [];
  const errors: FileParseError[] = [];

  if (files.length > FILE_LIMITS.maxFiles) {
    errors.push({
      fileName: '—',
      error: `Maximum ${FILE_LIMITS.maxFiles} files allowed`,
    });
    return { valid, errors };
  }

  let totalSizeMB = 0;

  for (const file of files) {
    totalSizeMB += file.size / (1024 * 1024);

    if (totalSizeMB > FILE_LIMITS.maxSizeMB) {
      errors.push({
        fileName: file.name,
        error: `Total file size exceeds ${FILE_LIMITS.maxSizeMB}MB limit`,
      });
      continue;
    }

    const isAllowed = ALLOWED_FILE_TYPES.includes(file.type as any) ||
      file.name.endsWith('.md') || file.name.endsWith('.txt');

    if (!isAllowed) {
      errors.push({
        fileName: file.name,
        error: 'Unsupported file type. Use PDF, DOCX, PPTX, TXT, or MD.',
      });
      continue;
    }

    valid.push(file);
  }

  return { valid, errors };
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const fileName = file.name;
  const fileType = file.type;
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (fileType === 'application/pdf' || ext === 'pdf') {
    return parsePDF(file);
  }
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === 'docx'
  ) {
    return parseDOCX(file);
  }
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    ext === 'pptx'
  ) {
    return parsePPTX(file);
  }
  if (fileType === 'text/plain' || ext === 'txt') {
    return parseTextFile(file);
  }
  if (fileType === 'text/markdown' || ext === 'md') {
    return parseTextFile(file);
  }

  throw new Error(`Unsupported file type: ${fileType}`);
}

async function parsePDF(file: File): Promise<ParsedFile> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker path
  const workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = '';
  const images: string[] = [];
  const maxPages = Math.min(pdf.numPages, 8);

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Extract text
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    text += `[Page ${i}]\n${pageText}\n\n`;

    // Render page to canvas for image capture
    if (images.length < FILE_LIMITS.maxImagesPerFile) {
      try {
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvas, viewport }).promise;
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          images.push(dataUrl);
        }
      } catch {
        // Skip image rendering for this page
      }
    }
  }

  return { text, images, fileName: file.name, fileType: 'pdf' };
}

async function parseDOCX(file: File): Promise<ParsedFile> {
  const mammoth = await import('mammoth');

  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  // Extract text from HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = result.value;
  const text = tempDiv.textContent || tempDiv.innerText || '';

  const images: string[] = [];

  // Extract images from the HTML (mammoth embeds them as img tags with src)
  const imgElements = tempDiv.querySelectorAll('img');
  for (const img of imgElements) {
    const src = img.getAttribute('src');
    if (src && src.startsWith('data:') && images.length < FILE_LIMITS.maxImagesPerFile) {
      images.push(src);
    }
  }

  return { text, images, fileName: file.name, fileType: 'docx' };
}

async function parsePPTX(file: File): Promise<ParsedFile> {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let text = '';
  const images: string[] = [];
  let slideNum = 0;

  // Process slide XML files
  const slideFiles = Object.keys(zip.files)
    .filter((name) => name.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort();

  for (const slidePath of slideFiles) {
    slideNum++;
    const slideXml = await zip.files[slidePath].async('text');

    // Extract text from slide XML
    const textMatches = slideXml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
    const slideText = textMatches
      .map((m: string) => m.replace(/<[^>]+>/g, ''))
      .join(' ');
    text += `[Slide ${slideNum}]\n${slideText}\n\n`;

    // Extract images
    if (images.length < FILE_LIMITS.maxImagesPerFile) {
      const imgRels = Object.keys(zip.files).filter(
        (name) =>
          name.includes(`ppt/slides/_rels/slide${slideNum}`) &&
          name.endsWith('.rels')
      );

      for (const relPath of imgRels) {
        const relXml = await zip.files[relPath].async('text');
        const imgRefs = relXml.match(/Target="[^"]*media\/[^"]+"/g) || [];

        for (const ref of imgRefs) {
          const target = ref.replace(/Target="/, '').replace(/"$/, '');
          const imgPath = `ppt/${target}`;

          if (zip.files[imgPath] && images.length < FILE_LIMITS.maxImagesPerFile) {
            const imgBlob = await zip.files[imgPath].async('blob');
            const dataUrl = await blobToDataURL(imgBlob);
            images.push(dataUrl);
          }
        }
      }
    }
  }

  return { text, images, fileName: file.name, fileType: 'pptx' };
}

async function parseTextFile(file: File): Promise<ParsedFile> {
  const text = await file.text();
  return { text, images: [], fileName: file.name, fileType: 'text' };
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}