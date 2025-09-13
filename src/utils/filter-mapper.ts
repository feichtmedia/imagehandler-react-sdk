import { ImageFilterType } from "../types";

/**
 * Function to map filter information and settings to a string for the image request URL.
 * @param filterObject Object with filters
 * @returns URL string with filters
 */
export function mapFilterObjectToUrl(
  filterObject: ImageFilterType | undefined
): string {
  // Fallback if object with filters is undefined
  if (!filterObject) return "";

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
      filterUrl = `${filterUrl}/filters:format(${filterObject[filter]})`;

      //
    } else if (
      filter === "proportion" &&
      filterObject[filter] !== undefined &&
      filterObject[filter] !== null
    ) {
      //
      // ----- Proportion
      // Check if the value is between 0 and 1
      if (
        filterObject[filter] < 0 ||
        filterObject[filter] > 1 ||
        isNaN(filterObject[filter])
      ) {
        console.error(
          `ImageHandler: Failed appending filter '${filter}'. The value must be between 0 and 1 but is ${filterObject[filter]}`
        );
        return; // Next iteration
      }
      filterUrl = `${filterUrl}/filters:proportion(${filterObject[filter]})`;

      //
    } else if (filter === "backgroundColor" && filterObject[filter]) {
      //
      // ----- Background Color
      filterUrl = `${filterUrl}/filters:background_color(${normalizeHexColor(
        filterObject[filter]
      )})`;

      //
    } else if (filter === "blur") {
      //
      // ----- Blur
      // Check for correct value between 0 and 100
      if (filterObject["blur"]) {
        if (filterObject["blur"] < 0 || filterObject["blur"] > 100) {
          console.error(
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
      filterUrl = `${filterUrl}/filters:fill(${normalizeHexColor(
        filterObject[filter]
      )})`;

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
    } else if (filter === "grayscale" && filterObject[filter] === true) {
      //
      // ----- Grayscale
      filterUrl = `${filterUrl}/filters:grayscale()`;

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
    } else if (filter === "quality") {
      //
      // ----- Quality
      // Check for correct value between 0 and 100
      if (filterObject["quality"]) {
        if (filterObject["quality"] < 0 || filterObject["quality"] > 100) {
          console.error(
            `ImageHandler: Failed appending filter '${filter}'. The value must be between 0 and 100 but is ${filterObject[filter]}`
          );
          return; // Next iteration
        }
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
        // Check for correct value between 0 and 255
        let rgbValuesCorrect = true;
        filterObject["rgb"].forEach((val) => {
          if (val > 255 || val < -255) {
            console.error(
              `ImageHandler: Failed appending filter 'rgb'. All values must be between -255 and 255 but one is not in this range.`
            );
            rgbValuesCorrect = false;
          }
        });

        // Next iteration
        if (!rgbValuesCorrect) return;

        // Append to URL
        const r = filterObject["rgb"][0].toString();
        const g = filterObject["rgb"][1].toString();
        const b = filterObject["rgb"][2].toString();
        filterUrl = `${filterUrl}/filters:rgb(${r},${g},${b})`;
      }

      //
    } else if (filter === "rotate") {
      //
      // ----- Rotate
      // Check for correct value between 0 and 360
      if (filterObject["rotate"]) {
        if (filterObject["rotate"] < 0 || filterObject["rotate"] > 360) {
          console.error(
            `ImageHandler: Failed appending filter '${filter}'. The value must be between 0 and 360 but is ${filterObject[filter]}`
          );
          return; // Next iteration
        }
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
        if (sharpenAmount < 0 || sharpenAmount > 10) {
          console.error(
            `ImageHandler: Failed appending 'amount' for filter 'sharpen'. The first value must be between 0 and 10 but is ${sharpenAmount}`
          );
          return; // Next iteration
        }
        if (sharpenRadius < 0 || sharpenRadius > 2) {
          console.error(
            `ImageHandler: Failed appending 'radius' for filter 'sharpen'. The second value must be between 0 and 10 but is ${sharpenRadius}`
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

        // Prepare the watermark key by removing the leading slash (if there is one)
        const watermarkKey = filterObject["watermark"].key.replace(/^\//, "");

        // Define the values
        const watermarkFilterValues = [
          "feichtmedia-imagemanager", // bucket
          watermarkKey, // key
          filterObject["watermark"].x, // x position
          filterObject["watermark"].y, // y position
          filterObject["watermark"].alpha !== undefined
            ? filterObject["watermark"].alpha
            : 0, // alpha (opacity)
          filterObject["watermark"].wRatio !== undefined
            ? filterObject["watermark"].wRatio
            : null, // w_ratio (width ratio)
          filterObject["watermark"].hRatio !== undefined
            ? filterObject["watermark"].hRatio
            : null, // h_ratio (height ratio)
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
          (faceIndex !== undefined && faceIndex < 0) ||
          (facePadding !== undefined && facePadding < 0)
        ) {
          console.error(
            "ImageHandler: Failed appending filter 'smartCrop'. Both faceIndex and facePadding must be at least 0."
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
        // Check if first character is a "/". If not, add one
        if (filterString.charAt(0) !== "/") {
          filterString = `/${filterString}`;
        }
        //  Append to URL
        filterUrl = `${filterUrl}${filterString}`;
      }
    }

    // Next iteration
  });

  // Return filter URL
  return filterUrl;
}

/**
 * Function to normalize hex color codes by removing the leading '#' if present.
 * @param hex Hex color code (e.g. '#ff0000' or 'ff0000')
 * @returns Normalized hex color code (e.g. 'ff0000')
 */
function normalizeHexColor(hex: string): string {
  // Remove leading '#' if present
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }

  // Return normalized hex color
  return hex;
}
