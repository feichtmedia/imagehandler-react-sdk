# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

- Added `AGENTS.md` file with instructions for AI coding assistants.
- Added `CLAUDE.md` for Claude Code which references to the `AGENTS.md` file.

**Changed logging:**

- Changed a filter that the active URL mode cannot express from `console.error` to `console.warn`. Dropping `blur` in query-parameter mode is a limitation of that mode, not a mistake by the consumer. A value the SDK genuinely cannot use — a `blur` of `500`, a malformed `rgb` array, a missing `endpointDomain` — stays a `console.error`.
- Changed every diagnostic message to be logged at most once per session. A misconfiguration used to be reported on every render and once per `srcSet` entry, so a single wrong filter on a single image produced eight messages per render. Messages include their offending value, so a changed value is still reported.

**Security fixes in the generated image request URLs:**

The values that end up in an image request URL — the `src` prop, the filter values and `endpointDomain` — were written into the URL verbatim. A project that fills any of them from content it does not fully control (a CMS field, a DAM filename, a URL parameter) could produce a URL that no longer points where it was supposed to. All generated URLs for well-formed sources and filter values are unchanged.

- Added escaping of the `src` prop in `prepareSrc()`. Whitespace, control characters, `?`, `#`, `,`, `\`, backticks, quotes and angle brackets are percent-encoded now. Whitespace was the critical one: a `src` such as `image.jpg 1w, https://example.com/other.jpg` ended the `srcSet` entry early and appended a second candidate URL pointing at an arbitrary host, which the browser was then free to load instead of the intended image. A `?` or `#` in a filename truncated the request path in the same way. Percent-encoding resolves to the identical object key, so a source containing a space now works where it previously produced a broken `srcSet`. `%` is deliberately left alone so already encoded sources are not encoded twice.
- Added removal of the relative path segments `.` and `..` in `prepareSrc()`, so a source value cannot traverse out of the path prefix it was meant to stay in.
- Added validation of the `backgroundColor` and `fill` filter values. Only hex color codes and plain keyword values such as `auto` are accepted. Both were previously written into the URL unchecked, so a value containing `)` could close the filter and append further filter segments of its own choosing.
- Added validation of the `format` filter against the list of formats the endpoint supports. It was typed but never checked at runtime.
- Added escaping of the `watermark` filter's `key`, and validation that `x`, `y`, `alpha`, `wRatio` and `hRatio` are numbers. A comma or a closing parenthesis in the key previously shifted every following watermark argument by one position.
- Added stripping of whitespace and control characters from `customFilter`, with a `console.error` when something was removed. The custom filter is still passed through verbatim otherwise — it stays the escape hatch for endpoint features the typed API does not cover.
- Fixed `useHttps` downgrading requests to plain HTTP when the option was explicitly set to `undefined`, for example when the config object is assembled from a variable that turns out to be unset. The provider now ignores `undefined` values instead of letting them overwrite a default, and `generateImgSrc()` only uses HTTP when `useHttps` is exactly `false`. The same applied to `defaultStyles.fullWidth` and `defaultStyles.transparentAltText`.

**Bug fixes in URL generation:**

- Added normalization of `endpointDomain`. A configured value that includes the protocol or a trailing slash, such as `https://images.example.com/`, produced `https://https://images.example.com//480x0/…` and is now accepted.
- Added a guard for an empty or unusable `src`. `ImageHandler` renders `null` and `getImgSrc()` / `getImgSrcSet()` return an empty string with a `console.error`, instead of requesting the bare endpoint domain.
- Added a `console.error` for filters that the active URL mode cannot express: every filter except `format`, `flip`, `flop`, `grayscale` / `greyscale` and `rotate` when `useQueryParams` is enabled, and `flip` and `flop` in the default path mode, for which the endpoint has no path filter at all. They were dropped silently before. The filters the SDK adds for the progressive placeholder are exempt, so the warning only ever names a filter the consumer set.
- Added `displayName` to the `ImageHandler` component so React DevTools shows its name instead of `ForwardRef`.
- Changed `width` and `height` to be normalized to non-negative integers. A float produced `/500.7x0/` and a value such as `"500px"` from a JavaScript consumer produced `/500pxx0/`.
- Changed `getImgSrcSet()` to fall back to `srcSetSizes` from the global config when no `sizes` argument is passed. The fallback existed in the code but was unreachable, because the parameter's own default value took precedence, so a configured `srcSetSizes` was ignored.
- Fixed the `quality` and `rotate` filters writing `/filters:quality(undefined)` into the URL when the filter key was present with an `undefined` value, which is what happens when a filter is built from a variable. Both are now skipped, as `blur` already was.
- Fixed a `TypeError` thrown by the `rgb` filter when the array held fewer than three entries. The filter mapper is documented to log and skip an invalid value rather than throw, and it now validates the array length and the value types.
- Fixed the `sharpen` and `smartCrop` filters accepting non-numeric values and writing `undefined` into the URL.
- Fixed `checkFiletype()` missing uppercase extensions and extensions followed by a query string or fragment, so `logo.SVG` and `logo.svg?v=2` bypassed the `optimizeSvg` / `optimizeGif` pass-through. A dotless path is no longer treated as an extension either.
- Fixed `hasSrcSet` rendering an empty `srcSet=""` attribute when no size survived the filtering.
- Fixed the `ImageHandler` fallback check not catching a missing `endpointDomain`. Only an empty string was checked, so a config without the key generated `https://undefined/…`. A missing `config` object no longer crashes the provider either.
- Fixed `createQueryParams()` using `Object.fromEntries()`, which is an ES2019 API. The package compiles with `target: es5` and a `lib` that stops at ES2017, so the call is outside the browser support the build promises and throws a `TypeError` in query-parameter mode on any browser older than the 2019 releases. The query parameters are now sorted and appended one by one, which produces the identical string.
- Fixed the `greyscale` filter doing nothing in the default path mode and the `grayscale` filter doing nothing in query-parameter mode. The endpoint names the same operation `grayscale` in its path filters and `greyscale` in the query parameters, so both spellings are now accepted in both modes and only ever produce one filter segment. The two keys are also collapsed before the global filters and the `filter` prop are merged, so a per-image `greyscale: false` switches off a global `grayscale: true` — a plain object spread would not, because the keys differ. Confirmed against the filter list of the AWS Dynamic Image Transformation for Amazon CloudFront solution.
- Fixed a typo in the `ImageHandler` console message ("ImageHandleer").

**Bug fixes in progressive lazy loading:**

- Added a fallback in `addLazyLoading()` for browsers without `IntersectionObserver`. All matching images are loaded immediately instead of staying on the blurred placeholder forever.
- Added a guard so `addLazyLoading()` and `removeLazyLoading()` do nothing when there is no `document`, rather than throwing during server-side rendering or in a test environment.
- Fixed `addLazyLoading()` leaking the previous `IntersectionObserver` when it was called more than once, for example in React's StrictMode or on a route change. It now tears down the existing observer first.
- Fixed `removeLazyLoading()` leaving elements observed. It queried the elements still carrying a `data-src` attribute and unobserved those, which missed every element that had already been swapped or removed from the DOM. It calls `disconnect()` now.

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
