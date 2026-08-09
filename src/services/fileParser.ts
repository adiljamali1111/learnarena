import type { DocumentImage } from '../types/dashboard';
import { addDocumentImage, clearDocumentImages } from './documentContext';

/* ===========================
   Constants
   =========================== */
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_FILES = 6;
const MAX_TOTAL_IMAGES = 10;
const MAX_IMAGES_PER_FILE = 8;

interface ParseResult {
  text: string;
  images: DocumentImage[];
  error?: string;
}

/* ===========================
   PDF Parsing
   =========================== */
async function parsePdf(file: File): Promise<ParseResult> {
  const pdfjsLib = await import('pdfjs-dist');
  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjsLib.GlobalWorkerOptions.workerSrc = String(pdfjsWorker.default || pdfjsWorker);

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = '';
  const images: DocumentImage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = (content.items as any[])
      .filter((item: any) => typeof item.str === 'string')
      .map((item: any) => item.str)
      .join(' ');
    text += `[Page ${i}]\n${pageText}\n\n`;

    // Render page as image (up to max pages)
    if (images.length < MAX_IMAGES_PER_FILE && i <= 8) {
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        await (page as any).render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        images.push({
          id: `pdf-${file.name}-${i}`,
          dataUrl,
          alt: `Page ${i}`,
        });
      }
    }
  }

  return { text: text.trim(), images };
}

/* ===========================
   DOCX Parsing
   =========================== */
async function parseDocx(file: File): Promise<ParseResult> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const images: DocumentImage[] = [];
  let imageCount = 0;

  // Extract raw text
  const textResult = await mammoth.extractRawText({ arrayBuffer });
  let text = textResult.value || '';

  // Also try HTML conversion to harvest images
  const htmlResult = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      convertImage: mammoth.images.imgElement(async (image: { contentType: string; readAsBase64String: () => Promise<string> }) => {
        if (imageCount >= MAX_IMAGES_PER_FILE) return { src: '' };
        try {
          const base64 = await image.readAsBase64String();
          const dataUrl = `data:${image.contentType};base64,${base64}`;
          imageCount++;
          images.push({
            id: `docx-img-${file.name}-${imageCount}`,
            dataUrl,
            alt: `Document image ${imageCount}`,
          });
          return { src: dataUrl };
        } catch {
          return { src: '' };
        }
      }),
    },
  );

  // If mammoth extracted less meaningful text, maybe use the HTML
  if (text.length < 20 && htmlResult.value) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlResult.value;
    text = tempDiv.textContent || tempDiv.innerText || text;
  }

  return { text: text.trim(), images };
}

/* ===========================
   PPTX Parsing
   =========================== */
async function parsePptx(file: File): Promise<ParseResult> {
  const JSZip = await import('jszip');
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  let text = '';
  const images: DocumentImage[] = [];
  let imageCount = 0;

  // Extract text from slide XMLs
  const slideFiles = Object.keys(zip.files).filter((name) =>
    name.match(/ppt\/slides\/slide\d+\.xml$/),
  );
  slideFiles.sort();

  for (const slidePath of slideFiles) {
    const slideNum = slidePath.match(/slide(\d+)\.xml$/)?.[1] || '';
    const content = await zip.files[slidePath].async('string');
    const textMatches = content.matchAll(/<a:t[^>]*>([^<]+)<\/a:t>/g);
    const slideText: string[] = [];
    for (const match of textMatches) {
      slideText.push(match[1]);
    }
    if (slideText.length > 0) {
      text += `[Slide ${slideNum}]\n${slideText.join(' ')}\n\n`;
    }
  }

  // Extract images from ppt/media
  const mediaFiles = Object.keys(zip.files).filter(
    (name) =>
      name.startsWith('ppt/media/') &&
      !name.endsWith('/') &&
      imageCount < MAX_IMAGES_PER_FILE,
  );

  for (const mediaPath of mediaFiles) {
    if (imageCount >= MAX_IMAGES_PER_FILE) break;
    try {
      const blob = await zip.files[mediaPath].async('blob');
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      imageCount++;
      images.push({
        id: `pptx-${mediaPath.split('/').pop()}`,
        dataUrl,
        alt: `Slide image ${imageCount}`,
      });
    } catch {
      // skip images that fail
    }
  }

  return { text: text.trim(), images };
}

/* ===========================
   TXT/MD Parsing
   =========================== */
async function parseTextFile(file: File): Promise<ParseResult> {
  const text = await file.text();
  return { text: text.trim(), images: [] };
}

/* ===========================
   Main Parser
   =========================== */
export async function parseFile(file: File): Promise<ParseResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { text: '', images: [], error: `File "${file.name}" exceeds 15 MB limit` };
  }

  const ext = file.name.split('.').pop()?.toLowerCase();

  try {
    switch (ext) {
      case 'pdf':
        return await parsePdf(file);
      case 'docx':
        return await parseDocx(file);
      case 'pptx':
        return await parsePptx(file);
      case 'txt':
      case 'md':
        return await parseTextFile(file);
      default:
        return { text: '', images: [], error: `Unsupported file type: .${ext}` };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      text: '',
      images: [],
      error: `Failed to parse "${file.name}": ${message}`,
    };
  }
}

export async function parseMultipleFiles(files: File[]): Promise<{
  text: string;
  images: DocumentImage[];
  errors: string[];
}> {
  if (files.length > MAX_FILES) {
    return {
      text: '',
      images: [],
      errors: [`Maximum ${MAX_FILES} files allowed`],
    };
  }

  clearDocumentImages();
  let allText = '';
  const allImages: DocumentImage[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await parseFile(file);
    if (result.error) {
      errors.push(result.error);
    } else {
      if (result.text) {
        allText += `\n\n=== ${file.name} ===\n\n${result.text}`;
      }
      // Track images globally
      for (const img of result.images) {
        if (allImages.length < MAX_TOTAL_IMAGES) {
          allImages.push(img);
          addDocumentImage(img);
        }
      }
    }
  }

  return {
    text: allText.trim(),
    images: allImages,
    errors,
  };
}