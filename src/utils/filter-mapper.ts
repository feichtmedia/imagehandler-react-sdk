import { ImageFilterType } from "../types";
import { logOnce } from "./general";

/**
 * Allowed values for the `format` filter. A value outside of this list is
 * rejected instead of being written into the URL, because the filter argument
 * is otherwise a free-form string that a consumer can fill from user data.
 */
const ALLOWED_FORMATS = [
  "gif",
  "jpeg",
  "jpg",
  "png",
  "avif",
  "webp",
  "tiff",
  "raw",
  "heif",
];

/**
 * Filters that only exist in query-parameter mode.
 *
 * The endpoint's path-mode filter list has no equivalent for `flip` and
 * `flop`, so they are listed here to get a warning instead of an image that
 * silently ignores them. `greyscale` is *not* in this list: it is the
 * query-mode spelling of the path-mode `grayscale` filter and is mapped.
 */
const QUERY_PARAM_ONLY_FILTERS = ["flip", "flop"];

/**
 * Check that a value is a usable, finite number.
 * @param value Value to check
 * @returns `true` if the value is a finite number
 */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && isFinite(value);
}

/**

/**
 * Escape the characters that would break out of a filter argument list or
 * split a `srcSet` entry.
 * @param value Filter argument to escape
 * @returns Escaped filter argument
 */
function sanitizeFilterArgument(value: string): string {
  return value.replace(/[\s\u0000-\u001f\u007f-\u009f,()]/g, (character) =>
    encodeURIComponent(character) === character
      ? `%${character.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`
      : encodeURIComponent(character)
  );
}

/**
 * Function to map filter information and settings to a string for the image request URL.
 * @param filterObject Object with filters
 * @returns URL string with filters
 */
export function mapFilterObjectToUrl(
  filterObject: ImageFilterType | undefined
): string {
  // Fallback if object with filters is undefined or not an object
  if (!filterObject || typeof filterObject !== "object") return "";

  // Store final filter URL in variable
  let filterUrl: string = "";

  Object.keys(filterObject).forEach((filter) => {
    if (filter === "animated") {
      //
      // ----- Animated
      if (
        filterObject["animated"] === true ||
        filterObject["animated"] === false
      ) {
        filterUrl = `${filterUrl}/filters:animated(${filterObject["animated"]})`;
      }

      //
    } else if (filter === "autojpg" && filterObject[filter] === true) {
      //
      // ----- Auto JPG
      filterUrl = `${filterUrl}/filters:autojpg()`;

      //
    } else if (filter === "format" && filterObject[filter]) {
      //
      // ----- Format
      // Reject anything that is not a known format
      const format = String(filterObject[filter]).toLowerCase();
      if (ALLOWED_FORMATS.indexOf(format) < 0) {
        logOnce(
          "error",
          `ImageHandler: Failed appending filter '${filter}'. The value must be one of '${ALLOWED_FORMATS.join(
            "', '"
          )}' but is ${filterObject[filter]}`
        );
        return; // Next iteration
      }
      filterUrl = `${filterUrl}/filters:format(${format})`;

      //
    } else if (
      filter === "proportion" &&
      filterObject[filter] !== undefined &&
      filterObject[filter] !== null
    ) {
      //
      // ----- Proportion
      // Check if the value is a number between 0 and 1
      if (
        !isFiniteNumber(filterObject[filter]) ||
        filterObject[filter] < 0 ||
        filterObject[filter] > 1
      ) {
        logOnce(
          "error",
          `ImageHandler: Failed appending filter '${filter}'. The value must be between 0 and 1 but is ${filterObject[filter]}`
        );
        return; // Next iteration
      }
      filterUrl = `${filterUrl}/filters:proportion(${filterObject[filter]})`;

      //
    } else if (filter === "backgroundColor" && filterObject[filter]) {
      //
      // ----- Background Color
      const backgroundColor = normalizeHexColor(filterObject[filter], filter);
      if (backgroundColor === null) return; // Next iteration
      filterUrl = `${filterUrl}/filters:background_color(${backgroundColor})`;

      //
    } else if (filter === "blur") {
      //
      // ----- Blur
      // Check for correct value between 0 and 100
      if (filterObject["blur"]) {
        if (
          !isFiniteNumber(filterObject["blur"]) ||
          filterObject["blur"] < 0 ||
          filterObject["blur"] > 100
        ) {
          logOnce(
            "error",
            `ImageHandler: Failed appending filter '${filter}'. The value must be between 0 and 100 but is ${filterObject[filter]}`
          );
          return; // Next iteration
        }
        // Append to URL
        filterUrl = `${filterUrl}/filters:blur(${filterObject[
          filter
        ]?.toString()})`;
      }

      //
    } else if (filter === "fill" && filterObject[filter]) {
      //
      // ----- Fill Color
      const fillColor = normalizeHexColor(filterObject[filter], filter);
      if (fillColor === null) return; // Next iteration
      filterUrl = `${filterUrl}/filters:fill(${fillColor})`;

      //
    } else if (filter === "equalize" && filterObject[filter] === true) {
      //
      // ----- Equalize
      filterUrl = `${filterUrl}/filters:equalize()`;

      //
    } else if (filter === "upscale" && filterObject[filter] === true) {
      //
      // ----- Upscale
      filterUrl = `${filterUrl}/filters:upscale()`;

      //
    } else if (filter === "noUpscale" && filterObject[filter] === true) {
      //
      // ----- No Upscale
      filterUrl = `${filterUrl}/filters:no_upscale()`;

      //
    } else if (
      (filter === "grayscale" || filter === "greyscale") &&
      filterObject[filter] === true
    ) {
      //
      // ----- Grayscale
      // The endpoint's path-mode filter is spelled `grayscale`, while the
      // query-parameter mode uses sharp's `greyscale`. Both name the same
      // operation, so either spelling maps here — but only once, in case a
      // consumer sets both.
      if (filterUrl.indexOf("/filters:grayscale()") < 0) {
        filterUrl = `${filterUrl}/filters:grayscale()`;
      }

      //
    } else if (filter === "stripExif" && filterObject[filter] === true) {
      //
      // ----- Strip EXIF
      filterUrl = `${filterUrl}/filters:strip_exif()`;

      //
    } else if (filter === "stripIcc" && filterObject[filter] === true) {
      //
      // ----- Strip ICC
      filterUrl = `${filterUrl}/filters:strip_icc()`;

      //
    } else if (filter === "stretch" && filterObject[filter] === true) {
      //
      // ----- Stretch
      filterUrl = `${filterUrl}/filters:stretch()`;

      //
    } else if (filter === "quality" && filterObject[filter] !== undefined) {
      //
      // ----- Quality
      // Check for correct value between 0 and 100
      if (
        !isFiniteNumber(filterObject["quality"]) ||
        filterObject["quality"] < 0 ||
        filterObject["quality"] > 100
      ) {
        logOnce(
          "error",
          `ImageHandler: Failed appending filter '${filter}'. The value must be between 0 and 100 but is ${filterObject[filter]}`
        );
        return; // Next iteration
      }
      // Append to URL
      filterUrl = `${filterUrl}/filters:quality(${filterObject[
        filter
      ]?.toString()})`;

      //
    } else if (filter === "rgb") {
      //
      // ----- RGB
      if (filterObject["rgb"]) {
        // Check that all three values exist and are between -255 and 255
        const rgbValues = filterObject["rgb"];
        const rgbValuesCorrect =
          Array.isArray(rgbValues) &&
          rgbValues.length === 3 &&
          rgbValues.every(
            (val) => isFiniteNumber(val) && val <= 255 && val >= -255
          );

        // Next iteration
        if (!rgbValuesCorrect) {
          logOnce(
            "error",
            `ImageHandler: Failed appending filter 'rgb'. It must be an array of exactly three numbers between -255 and 255.`
          );
          return;
        }

        // Append to URL
        const r = rgbValues[0].toString();
        const g = rgbValues[1].toString();
        const b = rgbValues[2].toString();
        filterUrl = `${filterUrl}/filters:rgb(${r},${g},${b})`;
      }

      //
    } else if (filter === "rotate" && filterObject[filter] !== undefined) {
      //
      // ----- Rotate
      // Check for correct value between 0 and 360
      if (
        !isFiniteNumber(filterObject["rotate"]) ||
        filterObject["rotate"] < 0 ||
        filterObject["rotate"] > 360
      ) {
        logOnce(
          "error",
          `ImageHandler: Failed appending filter '${filter}'. The value must be between 0 and 360 but is ${filterObject[filter]}`
        );
        return; // Next iteration
      }
      // Append to URL
      filterUrl = `${filterUrl}/filters:rotate(${filterObject[
        filter
      ]?.toString()})`;

      //
    } else if (filter === "sharpen") {
      //
      // ----- Sharpen
      if (filterObject["sharpen"]) {
        // Get values
        const sharpenAmount = filterObject["sharpen"].amount;
        const sharpenRadius = filterObject["sharpen"].radius;
        const sharpenLuminance = filterObject["sharpen"].luminanceOnly || false;

        // Check for correct values
        if (
          !isFiniteNumber(sharpenAmount) ||
          sharpenAmount < 0 ||
          sharpenAmount > 10
        ) {
          logOnce(
            "error",
            `ImageHandler: Failed appending 'amount' for filter 'sharpen'. The first value must be between 0 and 10 but is ${sharpenAmount}`
          );
          return; // Next iteration
        }
        if (
          !isFiniteNumber(sharpenRadius) ||
          sharpenRadius < 0 ||
          sharpenRadius > 2
        ) {
          logOnce(
            "error",
            `ImageHandler: Failed appending 'radius' for filter 'sharpen'. The second value must be between 0 and 2 but is ${sharpenRadius}`
          );
          return; // Next iteration
        }

        // Append to URL
        filterUrl = `${filterUrl}/filters:sharpen(${sharpenAmount},${sharpenRadius},${sharpenLuminance})`;
      }

      //
    } else if (filter === "watermark") {
      //
      // ----- Watermark
      // Check if all necessary values are set
      if (
        filterObject["watermark"] &&
        filterObject["watermark"].key &&
        filterObject["watermark"].x !== undefined &&
        filterObject["watermark"].y !== undefined
      ) {
        // Syntax: /filters:watermark(bucket,key,x,y,alpha[,w_ratio[,h_ratio]])
        const watermark = filterObject["watermark"];

        // All positions and ratios have to be numbers, otherwise the filter
        // would be written as `watermark(...,undefined,...)`
        const numericValues = [watermark.x, watermark.y, watermark.alpha]
          .concat([watermark.wRatio, watermark.hRatio])
          .filter((value) => value !== undefined);
        if (!numericValues.every(isFiniteNumber)) {
          logOnce(
            "error",
            `ImageHandler: Failed appending filter 'watermark'. 'x', 'y', 'alpha', 'wRatio' and 'hRatio' must be numbers.`
          );
          return; // Next iteration
        }

        // Prepare the watermark key by removing the leading slash (if there is
        // one) and escaping the characters that would end the argument list
        const watermarkKey = sanitizeFilterArgument(
          String(watermark.key).replace(/^\//, "")
        );

        // Define the values
        const watermarkFilterValues = [
          "feichtmedia-imagemanager", // bucket
          watermarkKey, // key
          watermark.x, // x position
          watermark.y, // y position
          watermark.alpha !== undefined ? watermark.alpha : 0, // alpha (opacity)
          watermark.wRatio !== undefined ? watermark.wRatio : null, // w_ratio (width ratio)
          watermark.hRatio !== undefined ? watermark.hRatio : null, // h_ratio (height ratio)
        ];

        // Append to URL
        filterUrl = `${filterUrl}/filters:watermark(${watermarkFilterValues
          .filter((value) => value !== null)
          .join(",")})`;
      }

      //
    } else if (filter === "smartCrop") {
      //
      // ----- Smart Crop
      // Check if filterObject["smartCrop"] is defined
      if (filterObject["smartCrop"]) {
        // Syntax: /filters:smart_crop([face_index[,face_padding]])
        const faceIndex = filterObject["smartCrop"].faceIndex;
        const facePadding = filterObject["smartCrop"].facePadding;

        if (
          (faceIndex !== undefined &&
            (!isFiniteNumber(faceIndex) || faceIndex < 0)) ||
          (facePadding !== undefined &&
            (!isFiniteNumber(facePadding) || facePadding < 0))
        ) {
          logOnce(
            "error",
            "ImageHandler: Failed appending filter 'smartCrop'. Both faceIndex and facePadding must be numbers of at least 0."
          );
          return; // Next iteration
        }

        const smartCropValues = [
          faceIndex !== undefined ? faceIndex : null, // face_index
          facePadding !== undefined ? facePadding : null, // face_padding
        ];

        // Append to URL
        filterUrl = `${filterUrl}/filters:smart_crop(${smartCropValues
          .filter((value) => value !== null) // Check explicitly for null, because 0 is a valid value in this case
          .join(",")})`;
      }

      //
    } else if (filter === "customFilter") {
      //
      // ----- Custom Filter
      let filterString = filterObject[filter];

      if (filterString) {
        // The custom filter is passed through verbatim on purpose — it is the
        // escape hatch for endpoint features the typed API does not cover.
        // Only whitespace and control characters are stripped, because they
        // would split the URL into a second `srcSet` candidate.
        const strippedFilterString = String(filterString).replace(
          /[\s\u0000-\u001f\u007f-\u009f]/g,
          ""
        );
        if (strippedFilterString !== filterString) {
          logOnce(
            "warn",
            `ImageHandler: Removed whitespace and control characters from filter 'customFilter'. They would break the generated URL.`
          );
        }
        filterString = strippedFilterString;

        if (filterString) {
          // Check if first character is a "/". If not, add one
          if (filterString.charAt(0) !== "/") {
            filterString = `/${filterString}`;
          }
          //  Append to URL
          filterUrl = `${filterUrl}${filterString}`;
        }
      }

      //
    } else if (
      QUERY_PARAM_ONLY_FILTERS.indexOf(filter) >= 0 &&
      filterObject[filter as keyof ImageFilterType] !== undefined
    ) {
      //
      // ----- Filters that only exist in query-parameter mode
      logOnce(
        "warn",
        `ImageHandler: The filter '${filter}' is only supported when 'useQueryParams' is enabled and was skipped.`
      );
    }

    // Next iteration
  });

  // Return filter URL
  return filterUrl;
}

/**
 * Function to normalize and validate a color value by removing the leading '#'
 * if present.
 *
 * Accepts a 3 to 8 digit hex code and the keyword values the endpoint supports
 * (for example `auto`). Everything else is rejected, so a color value that
 * originates from user data cannot inject additional URL or filter segments.
 * @param hex Hex color code (e.g. '#ff0000' or 'ff0000') or a keyword
 * @param filterName Name of the filter, used for the error message
 * @returns Normalized color value (e.g. 'ff0000'), or `null` when it is invalid
 */
function normalizeHexColor(hex: string, filterName: string): string | null {
  // Remove leading '#' if present
  const normalized = String(hex).replace(/^#/, "");

  // Accept hex codes and plain keywords only
  if (
    !/^[0-9a-fA-F]{3,8}$/.test(normalized) &&
    !/^[a-zA-Z]+$/.test(normalized)
  ) {
    logOnce(
      "error",
      `ImageHandler: Failed appending filter '${filterName}'. The value must be a hex color code or a keyword but is ${hex}`
    );
    return null;
  }

  // Return normalized hex color
  return normalized;
}


/**
 * Collapse the `greyscale` / `grayscale` alias onto the canonical `grayscale`
 * key.
 *
 * The endpoint names the same operation `grayscale` in its path filters and
 * `greyscale` in its query parameters, so the SDK accepts both. Collapsing them
 * before the global filters and the per-image filters are merged makes the
 * merge behave as a consumer expects: a per-image `greyscale: false` switches
 * off a global `grayscale: true`, which a plain object spread would not do
 * because the two keys are different. When one object carries both keys, the
 * canonical `grayscale` wins.
 * @param filterObject Filter object to normalize
 * @returns The same object when there is nothing to collapse, otherwise a copy
 */
export function collapseFilterAliases(
  filterObject: ImageFilterType | undefined
): ImageFilterType | undefined {
  // Nothing to do for the overwhelming majority of filter objects
  if (!filterObject || filterObject.greyscale === undefined) return filterObject;

  const { greyscale, ...rest } = filterObject;

  return {
    ...rest,
    grayscale:
      filterObject.grayscale !== undefined ? filterObject.grayscale : greyscale,
  };
}
