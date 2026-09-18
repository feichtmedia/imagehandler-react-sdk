import { ImageFilterType, RequestQueryParamsType } from "../types";

/**
 * Messages that were already logged, so a misconfiguration is reported once
 * instead of on every render and once per `srcSet` entry.
 */
const loggedMessages = new Set<string>();

/**
 * Log a diagnostic message at most once per session.
 *
 * `error` is for a value the consumer supplied that the SDK cannot use, `warn`
 * for a filter that is simply not available in the active URL mode and gets
 * dropped — that is a limitation of the mode, not a mistake by the consumer.
 * @param level Console level to log at
 * @param message Message to log
 */
export function logOnce(level: "error" | "warn", message: string): void {
  if (loggedMessages.has(message)) return;
  loggedMessages.add(message);

  if (level === "warn") console.warn(message);
  else console.error(message);
}

/**
 * Characters that must never reach a generated image request URL unescaped.
 *
 * Whitespace and control characters would split a `srcSet` entry into an
 * additional candidate, which allows a crafted `src` to inject a URL pointing
 * at an arbitrary host. `?` and `#` would end the path and turn the rest of the
 * source into a query string or fragment, and a trailing `,` breaks the
 * `srcSet` descriptor parsing. The remaining characters are markup delimiters
 * that have no business in an image path.
 *
 * `%` is deliberately **not** escaped so that sources which are already
 * percent-encoded are not encoded a second time.
 */
const UNSAFE_SRC_CHARACTERS = /[\u0000-\u0020\u007f-\u009f"'`<>\\?#,]/g;

/**
 * Percent-encode a single character.
 *
 * `encodeURIComponent()` leaves `!`, `'`, `(`, `)`, `*`, `-`, `.`, `_` and `~`
 * untouched, so those are encoded from their char code instead.
 * @param character Single character to encode
 * @returns Percent-encoded representation of the character
 */
function percentEncodeCharacter(character: string): string {
  const encoded = encodeURIComponent(character);

  if (encoded !== character) return encoded;

  return `%${character
    .charCodeAt(0)
    .toString(16)
    .toUpperCase()
    .padStart(2, "0")}`;
}

/**
 * Prepare the image `src` value for the use in other functions.
 *
 * Empty segments are dropped, relative segments (`.` and `..`) are removed so a
 * source cannot traverse out of its intended prefix, and every remaining
 * segment is escaped with {@link UNSAFE_SRC_CHARACTERS}.
 * @param src Image source value
 * @returns Prepared source value
 */
export function prepareSrc(src: string): string {
  // Fallback for missing or non-string sources (JavaScript consumers)
  if (typeof src !== "string" || src === "") return "";

  // Store new `src` value in variable
  let preparedSrc = "";

  // Split old `src` value by "/"
  // Create new `src` out of the sanitized, non-empty parts
  src.split("/").forEach((part) => {
    // Skip empty segments and relative segments
    if (part === "" || part === "." || part === "..") return;

    // Escape everything that would break the URL or the `srcSet` syntax
    const safePart = part.replace(
      UNSAFE_SRC_CHARACTERS,
      percentEncodeCharacter
    );

    preparedSrc = `${preparedSrc}/${safePart}`;
  });

  // Return prepared src
  return preparedSrc;
}

/**
 * Normalize the configured endpoint domain.
 *
 * Strips a protocol the consumer may have included, removes trailing slashes
 * and drops whitespace, so a slightly off configuration value cannot produce a
 * malformed URL such as `https://https://example.com//480x0/image.jpg`.
 * @param endpointDomain Endpoint domain from the global config
 * @returns Normalized endpoint domain without protocol and trailing slash
 */

export function normalizeEndpointDomain(endpointDomain: string): string {
  if (typeof endpointDomain !== "string") return "";

  return endpointDomain
    .replace(/[\s\u0000-\u001f\u007f-\u009f]/g, "") // Drop whitespace and control characters
    .replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "") // Drop a leading protocol
    .replace(/\/+$/, ""); // Drop trailing slashes
}

/**
 * Convert a dimension prop to a non-negative integer.
 *
 * The `width` / `height` props are typed as numbers but reach this function
 * from JavaScript consumers as well, where `"500px"`, `NaN` or a float would
 * otherwise end up verbatim in the URL path segment.
 * @param value Dimension value from the props or a `srcSet` size
 * @returns Non-negative integer, or `0` when the value cannot be interpreted
 */
export function toDimension(value: number | string | undefined): number {
  const parsed = typeof value === "number" ? value : parseFloat(String(value));

  if (!isFinite(parsed) || parsed <= 0) return 0;

  return Math.round(parsed);
}

/**
 * Filters that `createQueryParams()` is able to map to a query parameter.
 * Every other filter is dropped by the endpoint in query mode, so the consumer
 * gets a warning instead of a silently unfiltered image.
 *
 * `grayscale` and `greyscale` are the same operation under the endpoint's two
 * spellings, so both are accepted and both are sent as `greyscale`.
 */
const QUERY_PARAM_FILTERS = [
  "format",
  "flip",
  "flop",
  "grayscale",
  "greyscale",
  "rotate",
];

/**
 * Function to create a query params string out of multiple informations.
 * @param width Width of the optimized image
 * @param height Height of the optimized image
 * @param objectFit Fill mode of the original image in the optimized image's container size
 * @param filterObject Filter object from the `Image` component props or global config
 * @param warnUnsupportedFilters Whether to warn about filters query mode cannot express. Disabled for the filters the SDK adds itself
 * @returns Query params string
 */
export function createQueryParams(
  width?: number,
  height?: number,
  objectFit?: "cover" | "contain",
  filterObject?: ImageFilterType,
  warnUnsupportedFilters: boolean = true
): string {
  const params: RequestQueryParamsType = {};

  // Width
  const preparedWidth = toDimension(width);
  if (preparedWidth > 0) {
    params["width"] = preparedWidth;
  }

  // Height
  const preparedHeight = toDimension(height);
  if (preparedHeight > 0) {
    params["height"] = preparedHeight;
  }

  // Object fit
  if (objectFit) {
    params["fit"] = objectFit;
  }

  // Filters
  if (filterObject) {
    // Warn about every filter that query mode cannot express
    const unsupportedFilters = warnUnsupportedFilters
      ? Object.keys(filterObject).filter(
          (filter) =>
            QUERY_PARAM_FILTERS.indexOf(filter) < 0 &&
            filterObject[filter as keyof ImageFilterType] !== undefined
        )
      : [];
    if (unsupportedFilters.length > 0) {
      logOnce(
        "warn",
        `ImageHandler: The filter(s) '${unsupportedFilters.join(
          "', '"
        )}' are not supported when 'useQueryParams' is enabled and were skipped.`
      );
    }

    if (filterObject.format) params["format"] = filterObject.format as any;
    if (filterObject.flip) params["flip"] = filterObject.flip;
    if (filterObject.flop) params["flop"] = filterObject.flop;
    // Either spelling maps to the `greyscale` parameter the endpoint expects
    if (filterObject.greyscale || filterObject.grayscale) {
      params["greyscale"] = true;
    }
    if (
      typeof filterObject.rotate === "number" &&
      isFinite(filterObject.rotate)
    ) {
      params["rotate"] = filterObject.rotate;
    }
  }

  // Sort the query params alphabetically by key for better caching.
  // Appended one by one instead of going through `Object.fromEntries()`, which
  // is ES2019 and therefore outside the `lib` this package compiles against —
  // it would throw at runtime in every browser older than the 2019 releases.
  const searchParams = new URLSearchParams();
  Object.keys(params)
    .sort()
    .forEach((key) => {
      const value = params[key as keyof RequestQueryParamsType];
      if (value !== undefined) searchParams.append(key, String(value));
    });

  // Return query params string
  return searchParams.toString();
}

/**
 * Helper function to check if the image has a specific filetype by checking the file extension.
 *
 * The comparison ignores casing and any query string or fragment, so `.SVG` and
 * `image.svg?v=2` are detected as well.
 * @param filename Filename to check
 * @param filetype Filetype to check on the image
 * @returns Check result. `true` if the image has the filetype
 */
export function checkFiletype(filename: string, filetype: string): boolean {
  if (typeof filename !== "string") return false;

  // Drop a query string or fragment before looking at the extension
  const cleanedFilename = filename.split("?")[0].split("#")[0];

  // Only the last path segment can carry the extension
  const lastSegment = cleanedFilename.split("/").pop() || "";

  // A filename without a dot has no extension at all
  if (lastSegment.indexOf(".") < 0) return false;

  // Split filename at the "."
  const splittedFilename = lastSegment.split(".");

  // Get file extension from filename by splitting it
  const fileExtension = splittedFilename[splittedFilename.length - 1];

  // Return check result by comparing `fileExtension` with `filetype`
  return fileExtension.toLowerCase() === filetype.toLowerCase();
}
