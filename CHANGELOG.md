# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- Added `AGENTS.md` file with instructions for AI coding assistants.
- Added `CLAUDE.md` for Claude Code which references to the `AGENTS.md` file.

**Dependency and toolchain maintenance:**

This release only touches dependencies and tooling. The public API, the generated image request URLs and the `srcSet` values are unchanged.

- Added a `typecheck` script (`tsc --noEmit`) to type-check the sources without writing a build.
- Updated the development dependencies to their current versions: TypeScript to `5.9.3`, `@types/react` to `19.3.0` and `@types/node` to `24.13.5`. The build output is unchanged apart from a newer `__importStar` helper emitted by TypeScript and cosmetic parentheses in two generated type declarations.
- Updated the `peerDependencies` to no longer declare `react-dom`. The SDK never imports `react-dom`, so the entry only added an install-time constraint — and, because npm installs peer dependencies automatically, it also placed a second copy of React DOM inside the SDK's own `node_modules`. The `react` peer range stays at `>=18.2.0`: it already covers React 19 and was verified against React 19.3.0 and Next.js 16.3.5 with npm, pnpm and Yarn, none of which report a peer warning.
- Fixed `npm run build` failing on a fresh clone. The script started with `rm -r ./dist`, which errors when `dist/` does not exist yet, and it never does on a fresh clone because the directory is gitignored. It now uses `rm -rf ./dist`.
- Removed the unused `@types/react-dom` development dependency.

**Example app migrated from Create React App to Vite:**

- Added `vite.config.ts`, replacing `craco.config.js`. It deduplicates React through `resolve.dedupe` and permits the dev server to read the symlinked SDK from the parent directory — the same two problems the CRACO configuration solved for webpack. The dev server still serves on `localhost:3000`.
- Added `index.html` in the example app root, where Vite expects it, replacing `public/index.html` and its Create React App `%PUBLIC_URL%` placeholders.
- Added `src/vite-env.d.ts` for the Vite client types.
- Changed the example app's build setup from Create React App (`react-scripts` 5) with CRACO to Vite 8 with `@vitejs/plugin-react`. `react-scripts@5.0.1` requires `typescript: ^3.2.1 || ^4` and depends on `@testing-library/react@13`, which requires `react: ^18.0.0`; both conflict with the versions this repository uses and made a React 19 example app impossible.
- Updated the example app to React 19.3.0, TypeScript 5.9.3 and a Vite-compatible `tsconfig.json`.
- Updated the example app's `README.md` to document the Vite scripts instead of the Create React App ones, including the note that the SDK has to be built before starting the app.
- Removed the Create React App scaffolding that no longer applies: `craco.config.js`, `src/react-app-env.d.ts` and the unused test stubs `src/App.test.tsx` and `src/setupTests.ts`, which referenced `@testing-library` and asserted on text the example app does not contain.

## [1.7.0] – 2025-09-13

**Support for additional filters**

- Added support for additional filters: animated, autojpg, format, proportion, sharpen, smartCrop, stretch.
- Added the new helper function `normalizeHexColor()` to normalize hex color values to a 6-digit format without the leading `#` character.
- Updated the `mapFilterObjectToUrl()` function to use the new `normalizeHexColor()` function to normalize hex color values for the `backgroundColor` and `fill` filter options.
- Updated the `mapFilterObjectToUrl()` function to map the new filter options to the URL string.
- Updated type definitons to include new filter options: `ImageFilterType`, `SmartCropFilterType`.

**Support for query parameters in image requests**

- Added support for image requests using query parameters instead of URL path segments.
- Added additional typings.
- Added the `createQueryParams()` function to map width, height, filters and objectFit to query parameters.
- Updated the `generateImgSrc()` and `generateSrcSet()` functions to support image requests using query parameters.
- Updated the configuration context type `ConfigurationContextType` accordingly with the new `useQueryParams` option. The default value is `false` to keep the current behavior.
- Updated the `ImageComponent` component, `getImgSrc()` and `getImgSrcSet()` helper functions to not map the filters to a URL string anymore, as the filters are now passed as an object to the `generateImgSrc()` and `generateSrcSet()` functions. This allows passing it to the `createQueryParams()` function when `useQueryParams` is set to `true`.

## [1.6.6] – 2024-11-21

- Updated dependencies to the latest versions for the package and example app.
- Updated the peer dependencies `react` and `react-dom` to support React 18.2.0 and higher. This allows using the package with for example Next.js 15 and React 19.
- Updated content of the `README.md` file.

## [1.6.5] – 2024-04-22

- Added prop `htmlWidth` and `htmlHeight` to the `ImageComponent` component to allow the user to set the explicit width and height of the image in the HTML. If `htmlWidth` and/or `htmlHeight` are set, the `width` and `height` will be added to the `<img />` element in the HTML. The default `width` and `height` props could not be used because they are used for the image optimization.

## [1.6.4] – 2024-02-17

- Updated dependencies to the latest versions.
- Fixed issue where a prop `placeholder` was required on the `ImageComponent`/`ImageHandler` component and caused a TypeScript error when it was not set.

## [1.6.3] – 2024-01-17

- Created missing build files from previous release version `1.6.1`.

## [1.6.2] – 2024-01-17

- Created missing build files from previous release (version `1.6.1`).

## [1.6.1] – 2024-01-17

- Fixed issue in `ImageComponent` where the prop value `lazyLoading=false` was not working for GIFs when `optimizeGif` was set to `true` and not working for SVGs when `optimizeSvg` was set to `true` in the `ImageHandlerContext` context config.

## [1.6.0] – 2023-11-16

- Updated the `ImageComponent` component with `forwardRef` to allow the user to pass a ref to the component.
- Extended the filter options by the 'watermark' filter. Updated also all related resources: types `ImageFilterType` and `WatermarkFilterType`, filter mapper function `mapFilterObjectToUrl()`

## [1.5.0] – 2023-10-11

- Added `"use client"` directive to `ImageComponent`, `ConfigurationContext` and `ImageHandlerContext` which updated the components to client-components. This adds support for the Next.js app router and React 18.

## [1.4.0] – 2023-07-26

- Added ability to configure global image filter in the `ImageHandlerContext` which will be applied to every image request expect for those where the filters are override by image-specific filters.
- Extended type definition `ConfigurationContextType` by `globalFilters`.
- Updated type definition `ImageFilterType` for filter options to allow also custom string values for `backgroundColor` and `fill` instead of just Hex color values.
- Fixed issue in helper function `generateImgSrc()` where operator `>` was unsed on a string value.
- Fixed issue in helper function `mapFilterObjectToUrl()` where the `blur` filter was applied even if it is was set to `undefined`.

## [1.3.0] – 2023-05-05

- Added output of GIF images when `optimizeGif` is set to `false` to `Image` component.
- Updated type `ConfigurationContextType` with new config option `optimizeGif`.
- Updated `ImageHandlerContext` with new config option `optimizeGif` and set it's default value to `false`.
- Updated example app.

## [1.2.0] – 2022-12-12

- Added new prop `lazyLoading` to the `Image` component to give the user the option to disable the lazy loading and progressive image loading on single images.

## [1.1.0] – 2022-12-06

- Added new helper functions `getImgSrc()` and `getImgSrcSet()` to generate a image src and src-set outside of the `Image` component.
- Added fallback to `ImageHandler` context with `console.error` if the configuration context is missing.
- Updated targets for query selector of image observer for lazy loading.

## [1.0.0] – 2022-11-26

First major release.

## [0.5.0] – 2022-11-26

- Fixed issue with `defaultStyles` in config object which were overridden by the user's `defaultStyles` object.

## [0.4.0] – 2022-11-26

- Changed way of implementing Intersection Observer to prevent issues in Next.js and Gatsby.js.

## [0.3.0] – 2022-11-26

- New installation on dev server.

## [0.2.0] – 2022-11-26

- Added global context with configuration options and custom type for configuration context options.
- Added image component to output the image.
- Added type for available image filters.
- Added general helper functions: `checkFiletype()`
- Added function `mapFilterObjectToUrl()` to map for filters a string for the URL.
- Added function `generateImgSrc()` to create image source URLs.
- Added function `prepareSrc()` to prepare the `src` value before using it.
- Added function `generateSrcSet()` to generate a string of image sources for the `srcSet` attribute.
- Added lazy-loading for progressive image loading and some helper functions. The functions `addLazyLoading()` and `removeLazyLoading()` are exported from the package to allow the consumer to add and remove lazy loading from the site by using the `useEffect` hook.
- Added a browserslist to the `package.json` file.
- Renamed library from `@feichtmedia/imagehandler-react-component` to `@feichtmedia/imagehandler-react-sdk`.
- Renamed image component from `Image` to `ImageHandler`.

## [0.1.0] – 2022-11-24

Initial commit
