import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import { callOpenRouter, DEFAULT_MODEL } from './openrouter';

// Set pdfjs worker — use the bundled worker shipped with the package
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export type FileType = 'pdf' | 'docx' | 'image' | 'text' | 'unsupported';

export interface ProcessingResult {
  content: string;
  type: FileType;
}

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_DOCX_SIZE = 10 * 1024 * 1024; // 10 MB

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const TEXT_TYPES = new Set(['text/plain']);
const PDF_TYPES = new Set(['application/pdf']);
const DOCX_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

function getFileType(file: File): FileType {
  if (PDF_TYPES.has(file.type)) return 'pdf';
  if (DOCX_TYPES.has(file.type)) return 'docx';
  if (IMAGE_TYPES.has(file.type)) return 'image';
  if (TEXT_TYPES.has(file.type)) return 'text';
  // Fallback: check extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx') return 'docx';
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext ?? '')) return 'image';
  if (ext === 'txt') return 'text';
  return 'unsupported';
}

function validateFile(file: File): string | null {
  const type = getFileType(file);
  if (type === 'unsupported') return `Unsupported file type: ${file.name}`;

  if (type === 'pdf' && file.size > MAX_PDF_SIZE) {
    return `PDF too large (max 10MB): ${file.name}`;
  }
  if (type === 'docx' && file.size > MAX_DOCX_SIZE) {
    return `DOCX too large (max 10MB): ${file.name}`;
  }
  if (type === 'image' && file.size > MAX_IMAGE_SIZE) {
    return `Image too large (max 5MB): ${file.name}`;
  }

  if (file.size === 0) return `Empty file: ${file.name}`;

  return null;
}

async function processPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument(buffer).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(text);
  }

  return pages.join('\n\n').trim();
}

async function processDOCX(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
  // Strip HTML tags to plain text
  return result.value.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').replace(/\s+/g, ' ').trim();
}

async function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const response = await callOpenRouter(
          [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Transcribe all visible text in this image accurately.' },
                { type: 'image_url', image_url: { url: dataUrl } },
              ],
            },
          ],
          { model: DEFAULT_MODEL },
        );
        const text = response.choices?.[0]?.message?.content ?? '';
        resolve(text.trim());
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error(`Failed to read image file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function processText(file: File): Promise<string> {
  return file.text();
}

export interface ProcessedFile {
  id: string;
  filename: string;
  content: string;
  type: FileType;
}

/**
 * Process a single file: validate, extract text, and return the result.
 * Throws on validation error or processing failure.
 */
export async function processFile(file: File): Promise<ProcessedFile> {
  const validationError = validateFile(file);
  if (validationError) throw new Error(validationError);

  const type = getFileType(file);
  let content: string;

  switch (type) {
    case 'pdf':
      content = await processPDF(file);
      break;
    case 'docx':
      content = await processDOCX(file);
      break;
    case 'image':
      content = await processImage(file);
      break;
    case 'text':
      content = await processText(file);
      break;
    default:
      throw new Error(`Unsupported file type: ${file.name}`);
  }

  if (!content || content.length === 0) {
    throw new Error(`No text could be extracted from ${file.name}`);
  }

  return {
    id: crypto.randomUUID(),
    filename: file.name,
    content,
    type,
  };
}