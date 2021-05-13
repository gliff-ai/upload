import React, { Component, ReactNode } from "react";
import * as UTIF from "utif";
import { ImageFileInfo } from "./ImageFileInfo";

interface Props {
  setUploadedImage: (
    imageFileInfo: ImageFileInfo,
    slicesData?: Array<Array<ImageBitmap>>
  ) => void;
  spanElement: ReactNode; // span html element that defines the look of the upload button
  multiple: boolean;
}

export class UploadImage extends Component<Props> {
  private imageFileInfo: ImageFileInfo | null;

  private slicesData: Array<Array<ImageBitmap>> = [];

  constructor(props: Props) {
    super(props);
    this.imageFileInfo = null;
  }

  private uploadImage = (imageFile: File): void => {
    const patternTiff = /tiff|tif$/i;

    if (patternTiff.exec(imageFile.name)) {
      this.loadTiffImage(imageFile);
    } else {
      this.loadNonTiffImage(imageFile);
    }
  };

  private readFile = (file: File) =>
    new Promise((resolve: (buffer: ArrayBuffer) => void) => {
      const fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result as ArrayBuffer);
      };
      fr.readAsArrayBuffer(file);
    }).catch((error) => {
      console.log(error);
    });

  private loadNonTiffImage = (imageFile: File): void => {
    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();
      image.src = reader.result.toString();

      image.onload = () => {
        createImageBitmap(image)
          .then((imageBitmap) => {
            const slicesData = [[imageBitmap]];
            this.props.setUploadedImage(
              new ImageFileInfo({
                fileName: imageFile.name,
                width: image.width,
                height: image.height,
                num_slices: 1,
                num_channels: 3
              }),
              slicesData
            );
          })
          .catch((e) => console.log(e));
      };
    };
    reader.readAsDataURL(imageFile);
  };

  private loadTiffImage = (imageFile: File): void => {
    this.readFile(imageFile)
      .then((buffer: ArrayBuffer) => {
        // Decode the images using the UTIF library.
        const ifds = UTIF.decode(buffer);
        ifds.forEach((ifd) => UTIF.decodeImage(buffer, ifd));

        const { width, height } = ifds[0];

        const resolutionUnitstr = ifds[0].t296 as string[];

        // set this.imageFileInfo.resolutionX and resolutionY:
        let resolutionX: number;
        let resolutionY: number;
        let resolutionZ: number;
        if (resolutionUnitstr !== undefined && resolutionUnitstr.length === 1) {
          const resolutionUnit = parseInt(resolutionUnitstr[0], 10);

          const resolutionXstr = ifds[0].t282 as string[];
          const resolutionYstr = ifds[0].t283 as string[];

          if (resolutionXstr !== undefined && resolutionXstr.length === 1) {
            resolutionX = parseFloat(resolutionXstr[0]);
          }
          if (resolutionYstr !== undefined && resolutionYstr.length === 1) {
            resolutionY = parseFloat(resolutionYstr[0]);
          }

          // There is no reliable way of detecting the Z resolution.
          // If the resolution unit is 1, assume that everything has been scaled
          // according to the Z resolution (i.e resolutionZ = 1)
          // else assume that the Z resolution is the same as the X resolution.
          if (resolutionUnit === 1) {
            resolutionZ = 1;
          }
          else {
            resolutionZ = resolutionX;
          }
        }

        const descriptions = ifds[0].t270 as string[];
        const channels = this.getNumberOfChannels(descriptions);

        const slicesDataPromises: Promise<ImageBitmap>[][] = [];

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;

        ifds.forEach((ifd, i) => {
          // extract image data from the idf page:
          const sliceChannelRGBA8 = new Uint8ClampedArray(
            UTIF.toRGBA8(ifds[i])
          );
          const imageData = new ImageData(sliceChannelRGBA8, width, height);

          // colour the image according to which channel it's from and how many channels there are
          context.putImageData(imageData, 0, 0);

          let colour;
          const channel = channels - 1 - (i % channels); // channels are in reverse order in ifds
          if (channels > 1) {
            if (channel === 0) colour = "#FF0000FF";
            else if (channel === 1 && channels !== 2) colour = "#00FF00FF";
            else if (channel === 2) colour = "#0000FFFF";
            else if (channel === 3) colour = "#FFFF00FF";
            else if (channel === 4) colour = "#FF00FFFF";
            else if (channel === 5 || (channel === 1 && channels === 2))
              colour = "#00FFFFFF";

            context.fillStyle = colour;
            context.globalCompositeOperation = "multiply";
            context.fillRect(0, 0, canvas.width, canvas.height);
          }

          if (i % channels === 0) {
            slicesDataPromises.push(new Array<Promise<ImageBitmap>>());
          }

          // prettier-ignore
          slicesDataPromises[Math.floor(i / channels)][channel] = createImageBitmap(
            canvas
          );
        });

        // the linter complains if we await the createImageBitmaps inside a for loop, so instead we have to let the for loop
        // build a Promise<ImageBitmap>[][], and then use Promise.all twice to turn that into ImageBitmap[][]
        // (this should make it faster, not slower)
        // see https://eslint.org/docs/rules/no-await-in-loop
        // also https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
        // prettier-ignore
        const halfUnwrapped: Promise<ImageBitmap[]>[] = slicesDataPromises.map(
          async (sliceChannels) => Promise.all(sliceChannels)
        );
        Promise.all(halfUnwrapped)
          .then((slicesData) => {
            this.props.setUploadedImage(
              new ImageFileInfo({
                fileName: imageFile.name,
                resolution_x: resolutionX,
                resolution_y: resolutionY,
                resolution_z: resolutionZ,
                width,
                height,
                num_slices: slicesData.length,
                num_channels: slicesData[0].length,
              }),
              slicesData
            );
          })
          .catch((e) => {
            console.log(e);
          });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  private getNumberOfChannels = (descriptions: string[]): number => {
    // Get the number of extra channels in the uploaded tiff image
    let channels = 1;
    if (descriptions !== undefined && descriptions.length === 1) {
      const description = descriptions[0];

      if (description !== undefined && description.includes("channels=")) {
        // Image-J extension:
        // Image-J stores various parameters in the image description.
        // As such, it stores the number of channels inside the description and
        // store each individual channel in a separate IFD.

        const descChannelsIdx = description.indexOf("channels=") + 9;
        const descChannelsEnd = description.indexOf("\n", descChannelsIdx);
        channels = parseInt(
          description.slice(descChannelsIdx, descChannelsEnd),
          10
        );
      }
    }
    return channels || 1;
  };

  render = (): ReactNode => (
    <div style={{ textAlign: "center" }}>
      <label htmlFor="icon-button-file">
        <input
          accept="image/*"
          id="icon-button-file"
          type="file"
          style={{ display: "none", textAlign: "center" }}
          onChange={(e) => {
            for (let i = 0; i < e.target.files.length; i += 1) {
              this.uploadImage(e.target.files[i]);
            }
          }}
          multiple={this.props.multiple}
        />
        {this.props.spanElement}
      </label>
    </div>
  );
}
