export interface PageInfo {
  id: string;
  originalFileIndex: number;
  originalPageIndex: number;
  order: number;
  dataUrl: string;
  rotation: number;
  width: number;
  height: number;
  group?: number; // For splitting
}

export interface LoadedFile {
  name: string;
  arrayBuffer: ArrayBuffer;
}

export type ToolType = 'reorder' | 'rotate' | 'merge' | 'ocr' | 'split';
export type ViewMode = 'mosaic' | 'individual';
