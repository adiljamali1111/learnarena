declare module 'mammoth' {
  export interface Input {
    arrayBuffer: ArrayBuffer;
  }

  export interface Options {
    styleMap?: string | string[];
    includeDefaultStyleMap?: boolean;
    includeEmbeddedStyleMap?: boolean;
    convertImage?: ImageConverter;
    ignoreEmptyParagraphs?: boolean;
    idPrefix?: string;
    outputFormat?: 'html' | 'markdown';
  }

  export type ImageConverter = (image: Image) => Promise<{ src: string; alt?: string }>;

  export interface Image {
    contentType: string;
    readAsBase64String(): Promise<string>;
    readAsArrayBuffer(): Promise<ArrayBuffer>;
  }

  export interface Result {
    value: string;
    messages: { type: string; message: string }[];
  }

  export function convertToHtml(input: Input, options?: Options): Promise<Result>;
  export function extractRawText(input: Input): Promise<Result>;

  export const images: {
    dataUri: ImageConverter;
    imgElement(f: ImageConverter): ImageConverter;
  };
}