# Changelog

All notable changes to this project will be documented in this file.

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
