export interface PageInfo {
  id: string;
  originalFileIndex: number;
  originalPageIndex: number;
  order: number;
  dataUrl: string;
  rotation: number;
  width: number;
  height: number;
  group?: number;
  crop?: { x: number; y: number; width: number; height: number };
}

export interface LoadedFile {
  name: string;
  arrayBuffer: ArrayBuffer;
}

export type ToolType = 'reorder' | 'rotate' | 'merge' | 'ocr' | 'split' | 'numbering' | 'watermark' | 'crop' | 'protect';
export type ViewMode = 'mosaic' | 'individual';
