import type { DocumentImage } from '../types/dashboard';

let imageCache: DocumentImage[] = [];

export function getDocumentImages(): DocumentImage[] {
  return imageCache;
}

export function addDocumentImage(img: DocumentImage): void {
  imageCache.push(img);
}

export function clearDocumentImages(): void {
  imageCache = [];
}

export function setDocumentImages(images: DocumentImage[]): void {
  imageCache = images;
}