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
    if (filter === "backgroundColor") {
      //
      // ----- Background Color
      filterUrl = `${filterUrl}/filters:background_color(${filterObject[filter]})`;

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
    } else if (filter === "fill") {
      //
      // ----- Fill Color
      filterUrl = `${filterUrl}/filters:fill(${filterObject[filter]})`;

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
