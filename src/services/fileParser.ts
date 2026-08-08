// ── File parsing for PDF, DOCX, PPTX, TXT/MD ──

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_FILES = 6;
const MAX_IMAGES_PER_FILE = 8;

export interface ParseResult {
  text: string;
  images: string[]; // data-URLs
}

export interface FileValidation {
  valid: boolean;
  error?: string;
}

export function validateFiles(files: File[]): FileValidation {
  if (files.length > MAX_FILES) {
    return { valid: false, error: `Maximum ${MAX_FILES} files allowed` };
  }
  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) {
      return { valid: false, error: `"${f.name}" exceeds 15 MB limit` };
    }
  }
  return { valid: true };
}

export async function parseFile(file: File): Promise<ParseResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'pdf') return parsePdf(file);
  if (ext === 'docx') return parseDocx(file);
  if (ext === 'pptx') return parsePptx(file);
  // txt, md, or fallback
  return parseText(file);
}

// ── PDF ──

async function parsePdf(file: File): Promise<ParseResult> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const textParts: string[] = [];
  const images: string[] = [];

  for (let i = 1; i <= Math.min(pdf.numPages, 50); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    textParts.push(`[Page ${i}]\n${pageText}`);

    // Render pages to canvas for vision AI (limit images)
    if (images.length < MAX_IMAGES_PER_FILE && i <= 8) {
      try {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          images.push(canvas.toDataURL('image/jpeg', 0.7));
        }
      } catch {
        // skip image if render fails
      }
    }
  }

  return { text: textParts.join('\n\n'), images };
}

// ── DOCX ──

async function parseDocx(file: File): Promise<ParseResult> {
  const mammoth = await import('mammoth/mammoth.browser');
  const arrayBuffer = await file.arrayBuffer();
  const images: string[] = [];

  // Extract raw text
  const rawResult = await mammoth.extractRawText({ arrayBuffer });
  const text = rawResult.value;

  // Extract HTML with embedded images
  const htmlResult = await mammoth.convertToHtml({
    arrayBuffer,
    convertImage: mammoth.images.imgElement((image: any) => {
      return image.read('base64').then((b64: string) => {
        const ext = image.contentType?.split('/')[1] ?? 'png';
        const dataUrl = `data:${image.contentType ?? 'image/png'};base64,${b64}`;
        if (images.length < MAX_IMAGES_PER_FILE) {
          images.push(dataUrl);
        }
        return { src: dataUrl };
      });
    }),
  });

  return { text, images };
}

// ── PPTX ──

async function parsePptx(file: File): Promise<ParseResult> {
  const JSZip = (await import('jszip')).default;
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  const textParts: string[] = [];
  const images: string[] = [];

  // Read slide XMLs
  const slideFiles = Object.keys(zip.files).filter((name) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(name),
  ).sort();

  for (const slidePath of slideFiles) {
    const slideXml = await zip.files[slidePath].async('string');
    const textMatches = slideXml.match(/<a:t[^>]*>([^<]+)<\/a:t>/g);
    if (textMatches) {
      const slideText = textMatches
        .map((m) => m.replace(/<[^>]+>/g, ''))
        .join(' ');
      textParts.push(`[Slide ${slideFiles.indexOf(slidePath) + 1}]\n${slideText}`);
    }
  }

  // Harvest images from ppt/media/
  const mediaFiles = Object.keys(zip.files).filter((name) =>
    name.startsWith('ppt/media/') && !name.endsWith('/'),
  ).sort();

  for (const mediaPath of mediaFiles.slice(0, MAX_IMAGES_PER_FILE)) {
    const blob = await zip.files[mediaPath].async('blob');
    const dataUrl = await blobToDataUrl(blob);
    images.push(dataUrl);
  }

  return { text: textParts.join('\n\n'), images };
}

// ── Plain text ──

async function parseText(file: File): Promise<ParseResult> {
  const text = await file.text();
  return { text, images: [] };
}

// ── Helpers ──

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}