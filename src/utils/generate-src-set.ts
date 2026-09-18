import { ConfigurationContextType, ImageFilterType } from "../types";
import { generateImgSrc } from "./generate-img-src";
import { logOnce, toDimension } from "./general";

/**
 * Function to generate a set of image source that can be used as `srcSet` value.
 * @param sizes Array of sizes to generate the src-set for
 * @param maxImageWidth Max. width of the image
 * @param objectFit Fill mode of the original image in the optimized image's container size
 * @param filterObject Filter object from the `Image` component props or global config
 * @param imgSrc Prepared image source from `prepareSrc()`
 * @param config Config object from the global context
 * @returns String of image sources seperated by commas
 */
export function generateSrcSet(
  sizes: number[] = [480, 768, 992, 1280, 1920, 2048, 3840],
  maxImageWidth: number | undefined,
  objectFit: "cover" | "contain" = "cover",
  filterObject: ImageFilterType = {},
  imgSrc: string,
  config: ConfigurationContextType
): string {
  // Store srcSet
  let srcSet: string[] = [];

  // Fallback if the sizes are not an array (JavaScript consumers)
  if (!Array.isArray(sizes)) {
    logOnce(
      "error",
      `ImageHandler: Failed generating a src-set. 'srcSetSizes' must be an array of numbers.`
    );
    return "";
  }

  // Normalize the max. image width to a non-negative integer
  const preparedMaxImageWidth: number = toDimension(maxImageWidth);

  // Collect the widths that end up in the src-set, skipping invalid entries,
  // duplicates and every size above the max. image width specified by the user
  const widths: number[] = [];
  sizes.forEach((size) => {
    const preparedSize = toDimension(size);
    if (preparedSize === 0) return; // Skip sizes that are not usable
    if (preparedMaxImageWidth > 0 && preparedSize > preparedMaxImageWidth) {
      return; // Skip sizes greater than the max. image width
    }
    if (widths.indexOf(preparedSize) >= 0) return; // Skip duplicates
    widths.push(preparedSize);
  });

  // Add entry to srcSet with max. image width specified by the user (only if
  // the size doesn't exist in the `sizes` array)
  if (preparedMaxImageWidth > 0 && widths.indexOf(preparedMaxImageWidth) < 0) {
    widths.push(preparedMaxImageWidth);
  }

  // Loop through the widths and generate a image src for each one
  widths.forEach((width) => {
    const src = generateImgSrc(
      width,
      0,
      objectFit,
      filterObject,
      imgSrc,
      config
    ); // Create image src for current size
    srcSet.push(`${src} ${width}w`); // Push to array
  });

  // Return srcSet string
  return srcSet.join(", "); // Join array of sources
}
