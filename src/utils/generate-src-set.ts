import { ConfigurationContextType } from "../types";
import { generateImgSrc } from "./generate-img-src";

/**
 * Function to generate a set of image source that can be used as `srcSet` value.
 * @param sizes Array of sizes to generate the src-set for
 * @param maxImageWidth Max. width of the image
 * @param objectFit Fill mode of the original image in the optimized image's container size
 * @param filterUrl Filter url from `mapFilterObjectToUrl()`
 * @param imgSrc Prepared image source from `prepareSrc()`
 * @param config Config object from the global context
 * @returns String of image sources seperated by commas
 */
export function generateSrcSet(
  sizes: number[] = [480, 768, 992, 1280, 1920, 2048, 3840],
  maxImageWidth: number | undefined,
  objectFit: "cover" | "contain" = "cover",
  filterUrl: string | undefined = "",
  imgSrc: string,
  config: ConfigurationContextType
): string {
  // Store srcSet
  let srcSet: string[] = [];

  // Loop through sizes and generate a image src for each size
  sizes.forEach((size) => {
    if (maxImageWidth && size > maxImageWidth) return; // Stop if the size is greater than the max. image width specified by the user
    const src = generateImgSrc(size, 0, objectFit, filterUrl, imgSrc, config); // Create image src for current sizes
    srcSet.push(`${src} ${size}w`); // Push to array
  });

  // Add entry to srcSet with max. image width specified by the user (only if the sizes doesn't exist in the `sizes` array)
  if (maxImageWidth && sizes.indexOf(maxImageWidth) < 0) {
    const src = generateImgSrc(
      maxImageWidth,
      0,
      objectFit,
      filterUrl,
      imgSrc,
      config
    ); // Create image src for current sizes
    srcSet.push(`${src} ${maxImageWidth}w`); // Push to array
  }

  // Return srcSet string
  return srcSet.join(", "); // Join array of sources
}
