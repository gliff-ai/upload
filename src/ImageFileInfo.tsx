import { v4 as guidGenerator } from "uuid";

interface FileInfo {
  fileName: string;
  fileID?: string;
  resolution_x?: number;
  resolution_y?: number;
  resolution_z?: number;
  width: number;
  height: number;
  num_slices: number;
}

export class ImageFileInfo {
  readonly fileName: string;

  readonly fileID: string;

  readonly resolution_x: number;

  readonly resolution_y: number;

  readonly resolution_z: number;

  readonly width: number;

  readonly height: number;

  readonly num_slices: number;

  constructor(fileInfo: FileInfo) {
    this.fileName = fileInfo.fileName;
    this.fileID = fileInfo.fileID || guidGenerator();
    this.resolution_x = fileInfo.resolution_x;
    this.resolution_y = fileInfo.resolution_y;
    this.resolution_z = fileInfo.resolution_z;
    this.width = fileInfo.width;
    this.height = fileInfo.height;
    this.num_slices = fileInfo.num_slices;
  }
}
