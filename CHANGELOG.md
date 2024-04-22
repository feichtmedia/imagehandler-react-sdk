# Changelog

All notable changes to this project will be documented in this file.

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
