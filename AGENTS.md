# Agent Instructions

`@feichtmedia/imagehandler-react-sdk` is a published npm package (MIT) that provides React components and helper functions for requesting optimized images from the FeichtMedia ImageHandler endpoint. Consumers wrap their app in the `ImageHandlerContext` provider and render `<ImageHandler />` instead of `<img />`. The SDK turns props such as `width`, `height`, `objectFit`, `hasSrcSet` and `filter` into an image request URL, generates a matching `srcSet`, and optionally applies progressive (blur-up) lazy loading.

This is a **library, not an application**. It has no UI of its own, and almost every change touches the public API surface that downstream projects consume — props, context config options, exported helper signatures and the exported types. Treat additions and breaking changes accordingly (see [Versioning](#versioning)).

The `example-app/` directory is a manual test harness, not a product. There are no automated tests in this repository, so changes to URL generation, filters or lazy loading are verified by running the example app and inspecting the generated `src` / `srcSet` values.

## Handling Ambiguity

When a requirement, a value, or the right approach is unclear or conflicting — a missing spec, a Figma value that matches no existing design token, an ambiguous instruction, a choice between two valid patterns — **do not guess**. Ask the user for clarification before proceeding. Do not silently pick the "probably fine" interpretation, invent a fallback value, or proceed with an assumption stated only in a code comment. A short clarifying question is cheaper than a wrong implementation that looks plausible.

This applies to every part of the codebase and every skill/command used in this project, not just to new-feature work.

## Commands

| Purpose                                      | Command                               |
| -------------------------------------------- | ------------------------------------- |
| Build both bundles (ESM + CJS) for a release | `npm run build`                       |
| Build the ESM bundle only (`dist/esm`)       | `npm run build:esm`                   |
| Build the CommonJS bundle only (`dist/cjs`)  | `npm run build:cjs`                   |
| Recompile on file change (ESM, watch mode)   | `npm run watch`                       |
| Type-check the sources without emitting      | `npm run typecheck`                   |
| Start the example app on `localhost:3000`    | `cd example-app && npm start`         |
| Build the example app                        | `cd example-app && npm run build`     |
| Serve the built example app                  | `cd example-app && npm run preview`   |
| Publish a release to npm                     | `npm publish` (after `npm run build`) |

Notes:

- Releases are published manually: bump the version in `package.json`, update `CHANGELOG.md`, build, then `npm publish`. There is no CI pipeline.
- There are no test or lint commands — the repository has no test runner, ESLint or Prettier configuration. `npm run typecheck` (`tsc --noEmit`) is the only automated check available.
- **`tsconfig.json` sets `"types": []` on purpose.** The SDK is browser-only and imports nothing from Node. Without it, `@types/node` contributes a `/// <reference lib="es2020" />` that silently widens the effective `lib` far past the declared ES2017, so ES2019+ APIs type-check fine and then throw in the browsers `target: es5` promises to support — which is exactly how an `Object.fromEntries()` call shipped in 1.7.0. Do not remove it, and do not add an ambient `@types` package to work around a type error.
- The example app consumes the SDK through `"@feichtmedia/imagehandler-react-sdk": "file:.."`, so it resolves `dist/`. Build the SDK before starting the example app, otherwise changes will not be visible.
- `cd example-app && npm run build` runs `tsc --noEmit` before `vite build`, so it type-checks the harness as well.

## Tech Stack

| Layer                | Technology                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Language             | TypeScript 5.9 (`strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`), target ES5, `lib` up to ES2017, `types: []`, `jsx: react` |
| UI framework         | React 18.2 and newer, verified against React 19 — `react` is the single **peer dependency**, never bundled                       |
| Runtime dependencies | None. The package ships with `devDependencies` and `peerDependencies` only                                                       |
| Build                | `tsc` only (no bundler). Dual output: ESM → `dist/esm`, CommonJS → `dist/cjs`, type declarations alongside the ESM build         |
| Image backend        | [Dynamic Image Transformation for Amazon CloudFront](https://docs.aws.amazon.com/solutions/latest/dynamic-image-transformation-for-amazon-cloudfront/use-filters.html) — CloudFront (caching) → API Gateway (requests) → Thumbor / sharp (optimization) → S3 (image storage). **That linked filter table is the source of truth for the path-mode filter names and syntax** — check it before adding or renaming a filter |
| Media library        | FeichtMedia ImageManager, our DAM — holds the source images and the paths passed to `src`                                        |
| Lazy loading         | Native `IntersectionObserver`, plus the browser's native `loading="lazy"` as the non-progressive fallback                        |
| Example app          | Vite 8 with `@vitejs/plugin-react` and React 19. `resolve.dedupe` keeps React single-instance, `server.fs.allow` reaches the SDK |
| Distribution         | Public npm package `@feichtmedia/imagehandler-react-sdk`, published manually                                                     |
| Testing / Linting    | Not configured                                                                                                                   |

## Directory Overview

| Directory                             | Purpose                                                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/`                                | Complete source of the SDK and the only directory compiled by `tsc` (`include: ["src"]`). `src/index.ts` is the public entry point, `src/types.ts` holds all exported and internal types |
| `src/components/`                     | The React components the package exports, re-exported through barrel `index.ts` files                                                                                                    |
| `src/components/Image/`               | `Image.tsx` — the `ImageComponent`, exported publicly as `ImageHandler`. Renders the `<img />` and decides between pass-through, progressive and native lazy loading                     |
| `src/components/ImageHandlerContext/` | Global configuration context. `context.tsx` holds the bare `ConfigurationContext`, `ImageHandlerContext.tsx` the provider that merges user config over the defaults                      |
| `src/utils/`                          | The actual logic of the SDK: URL building, filter mapping, `srcSet` generation, lazy loading and the consumer-facing helper functions                                                    |
| `dist/`                               | Build output (`dist/esm`, `dist/cjs`). Generated by `tsc`, gitignored, shipped to npm via `files`. Never edit by hand and never commit                                                   |
| `example-app/`                        | Vite playground that consumes the SDK via `file:..`. Used for manual verification only, never published. Its own build output goes to `example-app/dist/` and is gitignored             |

## Architecture

The SDK is a thin, stateless URL builder around a React component. It holds no image data and performs no network requests itself — it only computes the URLs that the browser then requests from the ImageHandler endpoint.

### Public API surface

`src/index.ts` exports exactly six things:

- `ImageHandler` — the image component (internally `ImageComponent` in `src/components/Image/Image.tsx`, wrapped in `React.forwardRef`).
- `ImageHandlerContext` — the configuration provider.
- `addLazyLoading()` / `removeLazyLoading()` — attach and detach the `IntersectionObserver` used for progressive loading.
- `getImgSrc()` / `getImgSrcSet()` — build a `src` or `srcSet` outside of the component.

The types (`ConfigurationContextType`, `ImageFilterType`) live in `src/types.ts` but are **not** re-exported by `src/index.ts` or the `components/` barrels, so consumers cannot import them from the package root.

### Configuration flow

The consumer wraps the tree in `<ImageHandlerContext config={…}>`. The provider merges the user config **over** the SDK defaults (`useHttps: true`, `useQueryParams: false`, `srcSetSizes: [480, 768, 992, 1280, 1920, 2048, 3840]`, `optimizeSvg: false`, `optimizeGif: false`, `progressiveImageLoading: true`, `defaultStyles.fullWidth: true`, `defaultStyles.transparentAltText: true`) and writes the result into `ConfigurationContext`. `defaultStyles` is merged one level deeper so a partial `defaultStyles` object does not wipe the other default.

`ConfigurationContext` deliberately lives in its own file (`context.tsx`) so that `Image.tsx` and `utils/user-helper.ts` can consume the context without importing the provider component. `endpointDomain` is the only required option; the context default is an empty string, which is what the components use to detect a missing provider.

### Render path in `ImageHandler`

1. Read the config. If it is missing or `endpointDomain` is falsy, `console.error` and render `null` — the SDK never throws. The same happens when `src` holds no usable path segment.
2. Merge `config.defaultStyles` into the inline `style` object (`width: 100%`, `color: transparent`), with the consumer's `style` prop winning.
3. `prepareSrc()` (`utils/general.ts`) normalizes the source path by re-joining its non-empty segments with a leading slash. It also drops the relative segments `.` and `..` and percent-encodes every character that would break the URL or the `srcSet` syntax — see [URL safety](#url-safety).
4. **SVG pass-through**: if `optimizeSvg === false` and the extension is `svg`, return the image without dimensions or filters.
5. **GIF pass-through**: same for `optimizeGif === false` and the `gif` extension.
6. Merge `config.globalFilters` with the `filter` prop — the per-image prop wins per key.
7. Build `srcSet` via `generateSrcSet()` when `hasSrcSet` is set, and the fallback `src` via `generateImgSrc()`.
8. Pick one of three output modes:
   - `lazyLoading={false}` → plain `src` + `srcSet`, no `loading` attribute.
   - `progressiveImageLoading: true` (default) → a 40px-wide blurred placeholder in `src`, the real URL in `data-src` / `data-srcset`, `srcSet` intentionally left `undefined` until the observer swaps it in.
   - `progressiveImageLoading: false` → real `src` + `srcSet` with native `loading="lazy"`.

`htmlWidth` / `htmlHeight` exist separately from `width` / `height` because the latter two drive the image request, not the rendered HTML attributes.

### URL generation — two mutually exclusive modes

`utils/generate-img-src.ts` branches on `config.useQueryParams`:

- **Path mode (default)** produces Thumbor-style URLs: `{protocol}://{endpointDomain}/{width}x{height}[/fit-in]{filters}{src}`. `objectFit: "contain"` adds `/fit-in`; filters come from `mapFilterObjectToUrl()`. This mode supports the full `ImageFilterType`.
- **Query mode** (`useQueryParams: true`) produces `{protocol}://{endpointDomain}{src}?{params}` via `createQueryParams()` in `utils/general.ts`, which sorts parameters alphabetically so the CDN cache key stays stable.

`utils/generate-src-set.ts` walks `srcSetSizes`, skips every size larger than the `width` prop as well as duplicate and unusable sizes, appends an extra entry for the exact `width` when it is not already in the list, and emits `"{url} {size}w"` entries. Every entry is a full `generateImgSrc()` call with `height` forced to `0`. All sizes run through `toDimension()` first, so the emitted widths are always non-negative integers.

### Filter mapping

`utils/filter-mapper.ts` maps `ImageFilterType` to Thumbor filter segments (`/filters:blur(5)`) through one long `if/else if` chain keyed on the filter name. It validates ranges (`blur` and `quality` 0–100, `rotate` 0–360, `proportion` 0–1, `rgb` −255–255, `sharpen.amount` 0–10, `sharpen.radius` 0–2, `smartCrop` values ≥ 0) and, on an invalid value, logs a `console.error` and skips that one filter instead of throwing.

Every numeric filter value is additionally checked with `isFiniteNumber()`, so a filter key that is present but `undefined` — which is what happens when the value comes from a variable — is skipped rather than written into the URL as `undefined`. `normalizeHexColor()` strips a leading `#` for `backgroundColor` and `fill` and rejects anything that is not a hex code or a plain keyword such as `auto`. `format` is checked against `ALLOWED_FORMATS`. The `watermark` key runs through `sanitizeFilterArgument()`. `customFilter` is passed through verbatim apart from whitespace and control characters (a leading slash is added if missing) and is the escape hatch for endpoint features the typed API does not cover.

`flip` and `flop` exist in `ImageFilterType` but have **no path-mode mapping** — the endpoint's path filter list has no equivalent, so they only work in query-parameter mode and the mapper logs a `console.error` for them instead of dropping them silently. Do not invent segment names for them; check the endpoint's filter list first.

`grayscale` and `greyscale` are the **same operation under two spellings**: the path filter is `grayscale`, the query parameter is `greyscale`. Both keys are accepted in both modes and collapse to a single filter segment. `collapseFilterAliases()` folds them onto the canonical `grayscale` *before* the global filters and the `filter` prop are merged in `mergeFilters()`, so a per-image value overrides a global one across spellings. Keep that symmetry if you touch either one.

`crop` is the one filter that is **not** a `filters:` segment. It is the path segment `leftxtop:rightxbottom` and has to sit in front of the resolution, so `mapCropToUrl()` is called from `generateImgSrc()` rather than from the mapping chain.

### URL safety

The SDK writes three kinds of consumer input into a URL that the browser then requests: the `src` prop, the filter values and `endpointDomain`. A consuming project may fill any of them from content it does not fully control — a CMS field, a filename out of the DAM, a query parameter. Everything below is load-bearing; do not remove it while "simplifying" the URL builders.

- **`prepareSrc()` escapes the `src`.** Whitespace is the critical character: a `srcSet` entry is `"{url} {descriptor}"`, so a space inside the URL ends the entry and turns the rest of the source into a second candidate that can point at any host. `?` and `#` would truncate the request path. `%` is deliberately **not** escaped, otherwise an already percent-encoded source would be encoded twice.
- **`prepareSrc()` drops `.` and `..` segments** so a source cannot traverse out of its intended prefix.
- **Filter values are validated before they reach the URL.** A filter argument sits inside `/filters:name(value)`, so an unchecked value containing `)` can close the filter and append arbitrary further segments. `backgroundColor`, `fill`, `format` and the `watermark` key are the free-form ones and each has its own check.
- **`normalizeEndpointDomain()` strips a protocol, trailing slashes and whitespace** from the configured domain, so a slightly off config value cannot produce a malformed or misdirected URL.
- **`useHttps` only downgrades on an explicit `false`.** The provider drops `undefined` values from the user config before merging, so a config assembled from an unset variable cannot silently turn every request into plain HTTP.

There is no XSS surface here — the URL always starts with a literal `https://` or `http://` and React escapes attribute values — but a redirected image request is enough to leak a referrer or load third-party content, which is what these rules prevent.

### Diagnostics

Everything goes through `logOnce(level, message)` in `utils/general.ts`; no module calls `console.*` directly. Two rules:

- **`error`** — a value the consumer supplied that the SDK cannot use: a `blur` of `500`, a malformed `rgb` array, a missing `endpointDomain`, an unusable `src`.
- **`warn`** — a filter the active URL mode simply cannot express, which is a limitation of the mode rather than a mistake. Dropping `blur` under `useQueryParams: true` is the typical case.

Each distinct message is logged **once per session**. Without that, a single wrong filter on a single image produces one message per `srcSet` entry per render. Messages embed their offending value, so a changed value still reports.

### Performance

The SDK runs on the client on every render of every image, so the URL builders are on a hot path. Four things keep it cheap; do not undo them without measuring:

- **`mapFilterObjectToUrl()` caches per filter object** in a `WeakMap`. `generateSrcSet()` calls `generateImgSrc()` once per size with the same filter object, so the filter string is built once instead of up to eight times per image. **A filter object must therefore never be mutated after it was handed to the SDK.**
- **`mergeFilters()` avoids allocating** when only one side has filters, which keeps the object identity stable across renders so the cache actually hits. Replacing it with a plain `{...global, ...filter}` spread silently costs about a third of the render time.
- **The placeholder filter object is a module constant** (`PLACEHOLDER_FILTERS` in `Image.tsx`), not an inline literal, for the same reason.
- **`normalizeEndpointDomain()` remembers its last result**, because it otherwise runs three regexes once per generated URL.

Measured on 100 images with a seven-entry `srcSet` each, this is 22–33 % less time per render than 1.7.0. `React.memo` on `ImageHandler` was considered and skipped: `filter` and `style` are usually inline object literals, so a shallow prop comparison would fail every time and only add cost.

### Progressive lazy loading

`utils/lazy-loading.ts` keeps a module-level singleton `IntersectionObserver` (`threshold: 0`, `rootMargin: 200px 0px`). The consumer calls `addLazyLoading()` from a `useEffect` after mount and `removeLazyLoading()` in the cleanup — see `example-app/src/Layout.tsx`. On intersection, `setSrc()` copies `data-src` / `data-srcset` onto `src` / `srcset`, removes the data attributes and unobserves the element. The query targets both `img` and `picture source` elements, so a consumer's own markup can opt into the same mechanism.

Because the observer is a module singleton, `addLazyLoading()` tears down an existing observer with `disconnect()` before creating a new one — calling it twice (StrictMode, a route change) otherwise leaks the previous one. `removeLazyLoading()` also uses `disconnect()`; unobserving the elements a query still matches misses everything that was already swapped or removed from the DOM. Both functions no-op when there is no `document`, and when the browser has no `IntersectionObserver` all matching images are loaded immediately so they never stay on the placeholder.

This split — the component renders the data attributes, the consumer starts the observer — exists because the observer must run after the DOM is populated and works across Next.js and Gatsby hydration.

### SSR and bundling

`Image.tsx`, `ImageHandlerContext.tsx` and `context.tsx` all carry the `"use client"` directive so the package works inside the Next.js App Router. The build is plain `tsc` run twice (`build:esm`, `build:cjs`); `package.json` points `main` at the CJS build, `module` at the ESM build and `types` at `dist/esm/index.d.ts`. There is no `exports` map, so deep imports into `dist/` still resolve.

**The SDK is client-only, and that is a real constraint, not an oversight.** Everything reaches the config through `useContext`, which does not exist in the React Server Components runtime:

- `<ImageHandler />` **works** in a Server Component. The `"use client"` directive makes Next.js turn it into a client boundary, the provider's context still reaches it, and the HTML prerenders correctly. The cost is that a purely static `<img />` is pulled into the client bundle.
- `getImgSrc()` and `getImgSrcSet()` **crash** in a Server Component with `TypeError: (0 , b.useContext) is not a function`, which fails the whole Next.js production build. They are only safe inside Client Components. Verified against Next.js 16.3.5 / React 19.3.0.

Do not "fix" this by dropping the `"use client"` directives — that breaks the context for every consumer. The planned fix is an additive, context-free factory; it is specified in `TODO.md` and needs its own release.

## Accessibility

For frontend work, follow **WCAG 2.2 AA** as the technical accessibility baseline.

This SDK renders a single `<img />` element and no interactive UI, so most of the general frontend rules do not apply here. What matters is that the component never gets in the way of the consuming project's accessibility:

- **Never block the attribute pass-through.** `ImageHandler` spreads `...props` onto the `<img />`. `alt`, `title`, `role` and all `aria-*` attributes must keep reaching the DOM — do not filter, rename or wrap them.
- **Never generate a fallback `alt` text.** Decorative images must be able to opt out with `alt=""`; only the consumer knows whether an image is informative or decorative.
- **Be aware of `defaultStyles.transparentAltText`** (default `true`): it sets `color: transparent` on the image, which hides the alt text visually when the image fails to load. It stays available to screen readers, but projects that need a visible fallback must set `transparentAltText: false`. Any change to this default is a user-facing accessibility change and belongs in the changelog.
- **Keep `htmlWidth` / `htmlHeight` working.** They emit the real `width` / `height` attributes that let the browser reserve layout space and avoid content shift.
- **Progressive loading must always resolve.** The blurred placeholder is only ever an intermediate state; the real image must end up in `src` / `srcSet`. When adding to `lazy-loading.ts`, keep a working path for users without JavaScript or `IntersectionObserver`.
- **Ship no motion.** The SDK must not add transitions or animations of its own. Blur-up transitions are the consumer's job, where they can respect `prefers-reduced-motion`.

## Documentation conventions

### JSDoc

Every exported function – handlers and helpers alike – must have a JSDoc block:

```typescript
/**
 * Short description of what the function does.
 * @param param1 Description of param1
 * @param param2 Description of param2
 * @returns Description of the return value
 */
function myFunction(param1: string, param2: number): void { … }
```

Private/internal helper functions inside a file should also have JSDoc when their purpose is non-obvious.

### Changelog

All notable changes are tracked in [CHANGELOG.md](../CHANGELOG.md). Format:

```markdown
## [x.y.z] – YYYY-MM-DD

**Optional topic description:**

- Short bullet point describing the change in plain language.
  - Sub-bullet for additional detail if needed.
```

Add an entry for every feature, fix, or notable refactor. Group related changes under one version header. The date is the push date to Git.

Entries always start with the action like 'Added', 'Fixed', 'Updated', 'Removed' etc. Avoid passive voice or vague descriptions. The order is:

1. Added
2. Changed, Updated, Moved
3. Fixed
4. Removed

When working on the `dev` branch, add all changes under the `[Unreleased]` header. Before publishing a new version, make a release commit to dump the version number in the `package.json` and move all `[Unreleased]` entries under the new version header with the correct date. The `[Unreleased]` section get's renamed to the new version number and the current date is added. When releasing, no `[Unreleased]` section should exist anymore. See [CHANGELOG.md](../CHANGELOG.md) for examples.

### Versioning

This project follows semantic versioning. Version numbers are in the format `MAJOR.MINOR.PATCH`:

- **MAJOR** version increments for incompatible API changes.
- **MINOR** version increments for added functionality in a backwards-compatible manner.
- **PATCH** version increments for backwards-compatible bug fixes.

After each change, the `CHANGELOG.md` file must be updated with a new entry describing the change. Also, the `AGENTS.md` file must be reviewed and updated if necessary to reflect the change and ensure that AI coding agents have the most up-to-date information about the codebase. This is crucial for maintaining the productivity of AI coding agents and ensuring they can effectively assist with development tasks.

### Conventional commit messages

We do use multiple branches for development.

- `master` is the production branch. All commits to `master` must be tagged with a version number and follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification as well as FeichtMedia's release management conventions.
- `dev` is the development branch. All commits to `dev` must follow the Conventional Commits specification, but do not need to be tagged with a version number. This branch is used for development and testing of new features before they are merged into `master`. Merges happen via pull requests, which must be approved by the code owner.
- for larger fixes or features, we use feature branches. Feature branches are created from the latest `master` branch and are used to develop new features or fix bugs. To release, those branches get merged into `master` usind a PR. Afterwards, those branches are deleted. Feature branches must also follow the Conventional Commits specification.

**Current state of this repository:** `master`, `dev` and feature branches all exist on `origin`. `dev` is the active development branch and is where ongoing work lands — commit there, keep every entry under the `[Unreleased]` changelog header and do not bump the version. `master` only moves through a reviewed pull request from `dev` or from a feature branch, and that is where the release commit and the version tag belong.

Be aware that the existing history diverges from the rules above: the last git tag is `v1.2.0`, and release commits since then use the bare version number as the commit subject instead of a Conventional Commits message. Follow the conventions above for new work rather than copying the existing history.

## Agent Guidelines

- **Never commit `dist/`.** The build output is generated at release time and is gitignored on purpose. Do not add it to git, do not edit files inside it, and do not "fix" a bug by patching the compiled output — fix it in `src/` and rebuild.
- **Keep the package free of runtime dependencies.** The SDK ships with `devDependencies` and the `react` `peerDependency` only. Do not introduce a runtime dependency; solve the problem with the platform APIs already in use (`URLSearchParams`, `IntersectionObserver`) or ask before adding one.
- **Do not narrow the `react` peer range.** It is `>=18.2.0`, deliberately unbounded upwards. Pinning it to something like `^18.2.0 || ^19.0.0` looks tidier but would produce peer-dependency errors the day the next React major ships, which is the opposite of what is wanted. `react-dom` is intentionally *not* a peer dependency, because the SDK never imports it.
- **Do not upgrade to TypeScript 7 without a major release.** TS 7 removed `target: ES5` and `moduleResolution: node10`, both of which `tsconfig.json` depends on. Moving off them changes the emitted output's browser support, so it is a consumer-visible break. Stay on TypeScript 5.9.x; the details are in `TODO.md`.
- **Never write an unvalidated value straight into the URL.** `src`, the filter values and `endpointDomain` all come from the consuming project and may originate from content it does not control. See [URL safety](#url-safety) for what each of them is checked against, and keep numeric filter values behind `isFiniteNumber()` so a present-but-`undefined` key cannot become the literal string `undefined` in a URL.
- **Adding or changing an image filter touches four places.** Update (1) `ImageFilterType` in `src/types.ts`, (2) the mapping chain in `src/utils/filter-mapper.ts` including range validation and, for a free-form string value, an allow-list or an escape through `sanitizeFilterArgument()`, (3) `createQueryParams()` in `src/utils/general.ts` if the filter is also supported in query-parameter mode — and state explicitly in the changelog when it is not, and (4) `example-app/src/App.tsx` with a case that exercises the new filter, since that is the only way to verify the generated URL.
