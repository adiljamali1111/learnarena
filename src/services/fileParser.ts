/* ──────────────────────────────────────────
   LearnArena — File Parser Service
   ────────────────────────────────────────── */

export interface ParsedFile {
  fileName: string;
  text: string;
  images: string[];
  type: 'pdf' | 'txt' | 'md' | 'docx' | 'pptx';
}

export interface FileParseError {
  fileName: string;
  error: string;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 5;

export const FILE_LIMITS = {
  maxFiles: MAX_FILES,
  maxSizeMB: 20,
};

export function validateFiles(files: File[]): { valid: File[]; errors: FileParseError[] } {
  const valid: File[] = [];
  const errors: FileParseError[] = [];

  for (const file of files) {
    // Check size
    if (files.reduce((sum, f) => sum + f.size, 0) > MAX_FILE_SIZE) {
      errors.push({ fileName: file.name, error: 'Total file size exceeds 20MB limit' });
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push({ fileName: file.name, error: 'File exceeds 20MB size limit' });
      continue;
    }

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    const supported = ['pdf', 'docx', 'pptx', 'txt', 'md'];
    if (!ext || !supported.includes(ext)) {
      errors.push({ fileName: file.name, error: `Unsupported file type: .${ext || 'unknown'}` });
      continue;
    }

    valid.push(file);
  }

  // Limit total files
  if (valid.length > MAX_FILES) {
    const removed = valid.splice(MAX_FILES);
    for (const f of removed) {
      errors.push({ fileName: f.name, error: 'Exceeds maximum 5 files' });
    }
  }

  return { valid, errors };
}

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
  const supported = ['pdf', 'docx', 'pptx', 'txt', 'md'];
  const type = (supported.includes(ext) ? ext : 'txt') as ParsedFile['type'];

  // Text-based files
  if (type === 'txt' || type === 'md') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          fileName: file.name,
          text: reader.result as string,
          images: [],
          type,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // For binary formats, return a descriptive placeholder
  if (type === 'pdf') {
    return {
      fileName: file.name,
      text: `[PDF content from "${file.name}" — install pdf.js for full text extraction]\n\nPDF binary content loaded (${(file.size / 1024).toFixed(1)} KB).`,
      images: [],
      type: 'pdf',
    };
  }

  if (type === 'docx' || type === 'pptx') {
    return {
      fileName: file.name,
      text: `[Document content from "${file.name}" — install mammoth.js for full extraction]\n\nDocument loaded (${(file.size / 1024).toFixed(1)} KB).`,
      images: [],
      type,
    };
  }

  throw new Error(`Unsupported file type: ${type}`);
}
