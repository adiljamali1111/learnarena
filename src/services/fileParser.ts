/* ──────────────────────────────────────────
   LearnArena — File Parser Service
   ────────────────────────────────────────── */

import { ParsedDocument } from '../types';

/**
 * Parse a text file and extract its content.
 * In the browser, we read File objects via FileReader.
 */
export async function parseFile(file: File): Promise<ParsedDocument> {
  return new Promise((resolve, reject) => {
    // Determine type from extension
    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
    const supportedTypes = ['txt', 'md', 'pdf', 'docx', 'pptx'] as const;
    const type = supportedTypes.includes(ext as typeof supportedTypes[number])
      ? (ext as ParsedDocument['type'])
      : 'txt';

    // For now, handle text-based files directly
    if (type === 'txt' || type === 'md') {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        resolve({
          title: file.name.replace(/\.\w+$/, ''),
          content,
          type,
        });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
      return;
    }

    // For PDF, DOCX, PPTX — we'd need heavier libraries
    // For now, provide a graceful fallback
    if (type === 'pdf') {
      // In production, integrate pdf.js or similar
      resolve({
        title: file.name.replace(/\.pdf$/, ''),
        content: `[PDF content from "${file.name}" — install pdf.js for full extraction]`,
        type: 'pdf',
        pageCount: 1,
      });
      return;
    }

    if (type === 'docx' || type === 'pptx') {
      resolve({
        title: file.name.replace(/\.\w+$/, ''),
        content: `[Document content from "${file.name}" — install mammoth.js or similar for extraction]`,
        type,
      });
      return;
    }

    reject(new Error(`Unsupported file type: ${type}`));
  });
}

export type { ParsedDocument };
