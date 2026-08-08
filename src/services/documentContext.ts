// In-memory cache of uploaded document images (data-URLs) for vision AI
const imageCache = new Map<string, string[]>();

export function setDocumentImages(moduleTitle: string, images: string[]): void {
  imageCache.set(moduleTitle, images);
}

export function getDocumentImages(moduleTitle: string): string[] {
  return imageCache.get(moduleTitle) ?? [];
}

export function clearDocumentImages(moduleTitle: string): void {
  imageCache.delete(moduleTitle);
}

export function clearAllDocumentImages(): void {
  imageCache.clear();
}