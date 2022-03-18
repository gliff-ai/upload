export interface ImageFileInfo {
  fileName: string;
  width: number;
  height: number;
  size: number; // in bytes
  num_slices: number;
  num_channels: number;
  content_hash?: string; // i.e. md5
  resolution_x?: number;
  resolution_y?: number;
  resolution_z?: number;
}
