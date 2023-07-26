# Changelog

All notable changes to this project will be documented in this file.

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
