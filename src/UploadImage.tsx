import { Component, ReactNode } from "react";
import { Md5 } from "ts-md5";
import * as UTIF from "utif";
import { ImageFileInfo } from "./ImageFileInfo";

import dicomParser from "dicom-parser";
import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import cornerstoneMath from "cornerstone-math";
import cornerstoneTools from "cornerstone-tools";
import Hammer from "hammerjs";

const log = console;

interface CallbackArgs {
  slicesData: ImageBitmap[][];
  imageFileInfo: ImageFileInfo;
}

interface Props {
  setUploadedImage: (
    imageFileInfo: ImageFileInfo[],
    slicesData?: ImageBitmap[][][]
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

  private uploadImage = (imageFile: File): Promise<CallbackArgs> => {
    const patternTiff = /tiff|tif$/i;
    const patternDICOM = /dcm$/i;

    if (patternTiff.exec(imageFile.name)) {
      return this.loadTiffImage(imageFile);
    } else if (patternDICOM.exec(imageFile.name)) {
      return this.loadDICOMImage(imageFile);
    } else {
      return this.loadNonTiffImage(imageFile);
    }
  };

  private loadDICOMImage = (imageFile: File): Promise<CallbackArgs> => {
    // Cornerstone Tools
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.external.Hammer = Hammer;
    cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
    cornerstoneTools.init();

    // Image Loader
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      maxWebWorkers: navigator.hardwareConcurrency || 1,
      startWebWorkersOnDemand: true,
      taskConfiguration: {
        decodeTask: {
          initializeCodecsOnStartup: false,
          usePDFJS: false,
          strict: false,
        },
      },
      webWorkerTaskPaths: [
        "https://unpkg.com/cornerstone-wado-image-loader@4.1.0/dist/610.bundle.min.worker.js",
      ],
    });

    const imageId =
      cornerstoneWADOImageLoader.wadouri.fileManager.add(imageFile);
    return cornerstone.loadImage(imageId).then((image) => {
      console.log(image);
      console.log(image.data);
      console.log(image.getPixelData());
      console.log(
        `Height: ${image.height}, Width: ${image.width}, Slices: ${
          image.data.byteArray.length / (image.height * image.width)
        }`
      );

      const data = [];
      let pixelData: number[];
      if (image.data.byteArray.length > image.getPixelData()) {
        pixelData = image.data.byteArray;
      } else {
        pixelData = image.getPixelData();
      }

      if (image.color) {
        // insert alpha into pixelData:
        for (let i = 0; i < pixelData.length; i += 1) {
          data.push(pixelData[i]);
          if (i % 3 === 2) data.push(255); // alpha channel
        }
      } else {
        for (let i = 0; i < pixelData.length; i += 1) {
          data.push(pixelData[i]); // R
          data.push(pixelData[i]); // G
          data.push(pixelData[i]); // B
          data.push(255); // A
        }
      }

      // trim pixel data to a whole number of slices:
      const slices = Math.floor(
        pixelData.length / (image.height * image.width)
      );
      const imageDataSize = 4 * image.height * image.width * slices;
      data.splice(0, (data.length - imageDataSize) / 2); // remove front padding
      data.splice(imageDataSize); // remove rear padding
      
      const sliceBytes = image.width * image.height * 4;
      const sliceImageData: ImageData[] = [];
      for (let i = 0; i < slices; i += 1) {
        sliceImageData.push(
          new ImageData(
            new Uint8ClampedArray(
              data.slice(sliceBytes * i, sliceBytes * (i + 1))
            ),
            image.width,
            image.height
          )
        );
      }

      const imageBitmaps = sliceImageData.map((imageData) =>
        createImageBitmap(imageData)
      );
      return Promise.all(imageBitmaps).then((imageBitmaps) => {
        // wrap each imageBitmap in an array:
        const slicesData = imageBitmaps.map((imageBitmap) => [imageBitmap]);
        console.log(slicesData);
        return {
          slicesData: slicesData,
          imageFileInfo: new ImageFileInfo({
            fileName: imageFile.name,
            size: imageFile.size,
            width: image.width,
            height: image.height,
            num_slices: 1,
            num_channels: 3,
            content_hash: "test",
          }),
        } as CallbackArgs;
      });
    });
  };

  private loadNonTiffImage = (imageFile: File): Promise<CallbackArgs> =>
    new Promise((resolve: (callbackArgs: CallbackArgs) => void) => {
      const reader = new FileReader();

      reader.onload = () => {
        const image = new Image();
        image.src = reader.result.toString();
        const md5 = Md5.hashStr(reader.result.toString());

        image.onload = () => {
          createImageBitmap(image)
            .then((imageBitmap) => {
              resolve({
                slicesData: [[imageBitmap]],
                imageFileInfo: new ImageFileInfo({
                  fileName: imageFile.name,
                  size: imageFile.size,
                  width: image.width,
                  height: image.height,
                  num_slices: 1,
                  num_channels: 3,
                  content_hash: md5,
                }),
              });
            })
            .catch((e) => log.error(e));
        };
      };
      reader.readAsDataURL(imageFile);
    });

  private loadTiffImage = (imageFile: File): Promise<CallbackArgs> =>
    new Promise((resolve: (callbackArgs: CallbackArgs) => void) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Decode the images using the UTIF library.
        const ifds = UTIF.decode(reader.result as ArrayBuffer);
        ifds.forEach((ifd) =>
          UTIF.decodeImage(reader.result as ArrayBuffer, ifd)
        );

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
          } else {
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
            resolve({
              slicesData,
              imageFileInfo: new ImageFileInfo({
                fileName: imageFile.name,
                resolution_x: resolutionX,
                resolution_y: resolutionY,
                resolution_z: resolutionZ,
                size: imageFile.size,
                width,
                height,
                num_slices: slicesData.length,
                num_channels: slicesData[0].length,
              }),
            });
          })
          .catch((e) => {
            log.error(e);
          });
      };

      reader.readAsArrayBuffer(imageFile);
    });

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
          accept="image/*,.dcm"
          id="icon-button-file"
          type="file"
          style={{ display: "none", textAlign: "center" }}
          onChange={(e) => {
            const argsPromises: Promise<CallbackArgs>[] = [];
            for (let i = 0; i < e.target.files.length; i += 1) {
              argsPromises.push(this.uploadImage(e.target.files[i]));
            }
            Promise.allSettled(argsPromises)
              .then(
                (callbackArgsArray: PromiseSettledResult<CallbackArgs>[]) => {
                  const successfulUploads = callbackArgsArray.filter(
                    (result) => result.status === "fulfilled"
                  ) as PromiseFulfilledResult<CallbackArgs>[];
                  console.log(callbackArgsArray);
                  console.log(successfulUploads);
                  this.props.setUploadedImage(
                    successfulUploads.map((args) => args.value.imageFileInfo),
                    successfulUploads.map((args) => args.value.slicesData)
                  );
                }
              )
              .catch((err) => log.error(err));
          }}
          multiple={this.props.multiple}
        />
        {this.props.spanElement}
      </label>
    </div>
  );
}
