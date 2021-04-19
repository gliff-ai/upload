import { v4 as guidGenerator } from "uuid";

class ImageFileInfo {
  private fileName: string; // Name of imported image file

  private fileID: string; // ID of image file

  public resolution_x: number;

  public resolution_y: number;

  public resolution_z: number;

  public width: number; // grid width boxes

  public height: number; // grid height boxes

  constructor(fileName: string, fileID?: string) {
    this.fileName = fileName;
    this.fileID = fileID || guidGenerator();
    this.resolution_x = 0;
    this.resolution_y = 0;
    this.resolution_z = 0;
    this.width = 0;
    this.height = 0;
  }
}

export default ImageFileInfo;
