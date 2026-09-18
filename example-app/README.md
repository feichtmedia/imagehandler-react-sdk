# ImageHandler React SDK – Example App

Manual test harness for `@feichtmedia/imagehandler-react-sdk`, built with
[Vite](https://vite.dev/) and React 19. It is **not a product** and is never
published — it exists so that changes to URL generation, filters and lazy
loading can be verified in a browser.

Since this repository has no automated tests, this app is the only verification
path: render a case here and inspect the generated `src` / `srcSet` values in
the browser's element inspector or network tab.

## Setup

The app consumes the SDK through `"@feichtmedia/imagehandler-react-sdk": "file:.."`,
which resolves to the repository's `dist/` directory. **Build the SDK first**,
otherwise your changes will not be visible:

```bash
cd ..
npm install
npm run build
cd example-app
npm install
```

While working on the SDK, keep `npm run watch` running in the repository root.
The dev server reads the SDK from source rather than pre-bundling it, so
recompiled output is picked up on the next reload.

## Available scripts

| Command           | What it does                                                         |
| ----------------- | -------------------------------------------------------------------- |
| `npm start`       | Starts the dev server on [localhost:3000](http://localhost:3000)     |
| `npm run dev`     | Alias for `npm start`                                                |
| `npm run build`   | Type-checks with `tsc --noEmit`, then builds to `dist/`              |
| `npm run preview` | Serves the production build locally                                  |

## Adding a test case

Add an `<ImageHandler />` to `src/App.tsx`. Global configuration lives in
`src/index.tsx`, where the app is wrapped in `<ImageHandlerContext>` — change
`useQueryParams`, `optimizeSvg`, `progressiveImageLoading` or `globalFilters`
there to exercise the different code paths.

When you add or change an image filter, a case in `src/App.tsx` is required:
it is the only way to verify the URL the filter produces.
