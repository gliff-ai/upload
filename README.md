# gliff.ai UPLOAD

![Latest Tag](https://img.shields.io/github/v/tag/gliff-ai/upload?&label=latest_tag&style=flat-square&color=f2f2f2) ![Number of Open Issues](https://img.shields.io/github/issues/gliff-ai/upload?style=flat-square&color=yellow) ![Number of Open Pull Requests](https://img.shields.io/github/issues-pr/gliff-ai/upload?style=flat-square&color=yellow) [![Number of Contributors](https://img.shields.io/badge/all_contributors-1-yellow.svg?style=flat-square)](#contributors-) ![Repository Size](https://img.shields.io/github/repo-size/gliff-ai/upload?style=flat-square&color=red) ![Repo License](https://img.shields.io/github/license/gliff-ai/upload?color=0078FF&style=flat-square)

👋 **Welcome in!** 👋

This repository contains the Open Source code for [gliff.ai](https://gliff.ai)’s UPLOAD support library (gliff.ai’s component for uploading multidimensional images). 

UPLOAD aims to allow users to easily upload a variety of image files, including multidimensional TIFFs, for the purposes of developing imaging AI products. When the full [gliff.ai platform](https://gliff.ai/software/) is used, UPLOAD provides just one step in developing high-quality and auditable datasets that satisfy any relevant regulatory frameworks which enables our users to build world-changing and trustworthy AI models and products. 

✅ **We welcome contributions on this repository!** ✅

## Table of Contents

Looking for something specific? 🔍

- [Repository Introduction](#gliffai-upload)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Development](#development)
- [Linting and Formatting](#linting-and-formatting)
- [Testing](#testing)
- [Examples of Use](#examples-of-use)
- [Contribute](#contribute)
- [Contact](#contact)
- [License](#license)

## Installation

[{{back to navigation}}](#table-of-contents)

Run `npm install @gliff-ai/upload` in your command line to install the package from the npm registry.

## Development

[{{back to navigation}}](#table-of-contents)

Frontend code should always be written in [Typescript](https://www.typescriptlang.org/) and transpiled using the options in `tsconfig.json` in this repository. npm should always be used for package management.

`npm run serve` will run a local webpack developer server for quick access.

To get started, run `npm i` and `npm run build` from the root directory.

## Linting and Formatting

[{{back to navigation}}](#table-of-contents)

As a standard, all code contributions should be linted with [ESLint](https://eslint.org/) using `.eslintrc.js` and formatted with [Prettier](https://prettier.io/). **Note:** HTML + CSS, mark-up and mark-down code are exemptions and should be formatted using [Prettier](https://prettier.io/) but do not need to be linted.

`npm run lint` will lint the codebase.

Our GitHub Actions will also lint any pull requests before they're merged.

## Testing

[{{back to navigation}}](#table-of-contents)

All code contributions should be tested using both the [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

`npm run test` will run any existing tests in our codebase.

Our GitHub Actions will also test any pull requests before they're merged! These all must pass and have 2 reviewers approval before a pull request can merge. If one or a few fail and your troubleshooting is not giving an answer, please check out the [gliff.ai Contribution Guide](https://github.com/gliff-ai/.github/blob/main/CONTRIBUTING.md) 👋 for further guidance.

## Continuous Integration

[{{back to navigation}}](#table-of-contents)

GitHub Actions should only be included under the `.github/workflows` path.

## Examples of Use

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

## Contribute

[{{back to navigation}}](#table-of-contents)

We welcome all contributors and any contributions on this project through the likes of feedback on or suggesting features and enhancements, raising bug problems, reporting on security vulnerabilities, reviewing code, requesting or creating tests, user testing etc. to ensure gliff.ai can help enable the best and biggest positive impact possible. 

Sounds good and want to contribute to the project? 🧑‍💻 \
Please check the [gliff.ai Contribution Guide]((https://github.com/gliff-ai/.github/blob/main/CONTRIBUTING.md)) 👋 before you get started. Don’t forget the [gliff.ai Code of Conduct]((https://github.com/gliff-ai/.github/blob/main/CODE_OF_CONDUCT.md)) ⚠️ and  [gliff.ai Security Policy]((https://github.com/gliff-ai/.github/blob/main/SECURITY.md)) 🔒 too!

A big thank you from the entire gliff.ai team to these fellow contributors ([emoji key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://linktr.ee/joshuajames_smith"><img src="https://avatars.githubusercontent.com/u/83074763?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Josh</b></sub></a><br /><a href="https://github.com/gliff-ai/upload/commits?author=joshuajames-smith" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

_This project follows the [all-contributors specification](https://github.com/all-contributors/all-contributors) and makes use of the [all-contributors emoji key](https://allcontributors.org/docs/en/emoji-key) to credit the types of contributions from our community!_

## Contact

[{{back to navigation}}](#table-of-contents)

Need some help? 🤔 Have a question? 🧠 \
Reach out to the gliff.ai team at [community@gliff.ai](mailto:community@gliff.ai?subject=[GitHub]) or on GitHub.

## License

[{{back to navigation}}](#table-of-contents)

This code is licensed under a [GNU AGPLv3 license](https://github.com/gliff-ai/upload/blob/main/LICENSE) 📝 \
Curious about our reasoning for this? Read about them [here](https://gliff.ai/articles/open-source-license-gnu-agplv3/)!
