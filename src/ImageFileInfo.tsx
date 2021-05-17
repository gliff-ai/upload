import { v4 as guidGenerator } from "uuid";

interface FileInfo {
  fileName: string;
  fileID?: string;
  resolution_x?: number;
  resolution_y?: number;
  resolution_z?: number;
  width: number;
  height: number;
  size: number; // in bytes
  num_slices: number;
  num_channels: number;
}

export class ImageFileInfo {
  readonly fileName: string;

  readonly fileID: string;

  readonly resolution_x: number;

  readonly resolution_y: number;

  readonly resolution_z: number;

  readonly width: number;

  readonly height: number;

  readonly size: number; // in bytes

  readonly num_slices: number;

  readonly num_channels: number;

  constructor(fileInfo: FileInfo) {
    this.fileName = fileInfo.fileName;
    this.fileID = fileInfo.fileID || guidGenerator();
    this.resolution_x = fileInfo.resolution_x;
    this.resolution_y = fileInfo.resolution_y;
    this.resolution_z = fileInfo.resolution_z;
    this.size = fileInfo.size;
    this.width = fileInfo.width;
    this.height = fileInfo.height;
    this.num_slices = fileInfo.num_slices;
    this.num_channels = fileInfo.num_channels;
  }
}
