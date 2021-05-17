# [gliff.ai](https://gliff.ai) UPLOAD

This repository contains the Open Source source code for [gliff.ai](https://gliff.ai)'s UPLOAD component for uploading multidimensional images.

Technical documentation will be available soon.

## Installation

`npm install @gliff-ai/upload` will install the package from npm registry.

## Examples of use

Import the `UploadImage` module and the `ImageFileInfo` type:

```javascript
import { UploadImage } from @gliff-ai/upload;
import { ImageFileInfo } from @gliff-ai/upload/typings;
```

Use the `UploadImage` module:

```javascript
setUploadedImage = (
  imageFileInfo: ImageFileInfo,
  slicesData: Array<Array<ImageBitmap>>
): void => {
  this.imageFileInfo = imageFileInfo;
  this.slicesData = slicesData;
};

render = (): ReactNode => (
  <UploadImage
    setUploadedImage={this.setUploadedImage}
    spanElement={
      <Button aria-label="upload-picture" component="span">
        <Backup />
      </Button>
    } // A <span> element that marks the clickable area.
    multiple // allow uploading multiple files at once; use multiple={false} to disallow
  />
);
```

The example above uses [Material-UI](https://material-ui.com/).

## Development

Frontend code should be written in [Typescript](https://www.typescriptlang.org/) and transpiled using the options in `tsconfig.json`.
Frontend code is distributed using the npm registry.
NPM should be used for package management.

Please follow [gliff.ai](https://gliff.ai)'s Community Guidelines when contributing to this codebase.

Run `npm i` and `npm run build` from the root directory to get started.

You can import this package by running `npm link` in the package directory, then `npm link @gliff-ai/upload` in the directory where you want to use the package (this will create a symbolic link).

## Linting and formatting

Code should be linted with [ESLint](https://eslint.org/) using `.eslintrc.js` and formatted with [Prettier](https://prettier.io/).
HTML + CSS, mark-up and mark-down should all be formatted using prettier.

`npm run lint` will lint the codebase.

We also provide a [pre-commit](https://pre-commit.com/) config for running a variety of linters locally on commit.

Our GitHub Actions will also lint any pull requests before they're merged.

## Testing

Code should be tested using [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

`npm run test` will run any existing tests in our codebase.

We also provide a [pre-commit](https://pre-commit.com/) config for running a tests locally before a push.

Our GitHub Actions will also test any pull requests before they're merged.

## Continuous integration

Pre-commit actions should be configured in `.pre-commit-config.yaml`.

GitHub Actions should be included under `.github/workflows`.

## License

This code is licensed under a GNU AGPLv3 license. Our reasons for this will be published on our website soon.
