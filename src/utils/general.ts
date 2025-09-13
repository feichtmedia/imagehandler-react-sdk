import { ImageFilterType, RequestQueryParamsType } from "../types";

/**
 * Prepare the image `src` value for the use in other functions.
 * @param src Image source value
 * @returns Prepared source value
 */
export function prepareSrc(src: string): string {
  // Store new `src` value in variable
  let preparedSrc = "";

  // Split old `src` value by "/"
  // Create new `src` out of splitted parts
  src.split("/").forEach((part) => {
    if (part !== "") preparedSrc = `${preparedSrc}/${part}`;
  });

  // Return prepared src
  return preparedSrc;
}

/**
 * Helper function to check if the image has a specific filetype by checking the file extension.
 * @param filename Filename to check
 * @param filetype Filetype to check on the image
 * @returns Check result. `true` if the image has the filetype
 */
export function checkFiletype(filename: string, filetype: string): boolean {
  // Split filename at the "."
  const splittedFilename = filename.split(".");

  // Get file extension from filename by splitting it
  const fileExtension = splittedFilename[splittedFilename.length - 1];

  // Return check result by comparing `fileExtension` with `filetype`
  return fileExtension === filetype;
}

/**
 * Function to create a query params string out of multiple informations.
 * @param width Width of the optimized image
 * @param height Height of the optimized image
 * @param objectFit Fill mode of the original image in the optimized image's container size
 * @param filterObject Filter object from the `Image` component props or global config
 * @returns Query params string
 */
export function createQueryParams(
  width?: number,
  height?: number,
  objectFit?: "cover" | "contain",
  filterObject?: ImageFilterType
): string {
  let params: RequestQueryParamsType = {};

  // Width
  if (width && width > 0) {
    params["width"] = width;
  }

  // Height
  if (height && height > 0) {
    params["height"] = height;
  }

  // Object fit
  if (objectFit) {
    params["fit"] = objectFit;
  }

  // Filters
  if (filterObject) {
    if (filterObject.format) params["format"] = filterObject.format as any;
    if (filterObject.flip) params["flip"] = true;
    if (filterObject.flop) params["flop"] = filterObject.flop;
    if (filterObject.greyscale) params["greyscale"] = filterObject.greyscale;
    if (filterObject.rotate) params["rotate"] = filterObject.rotate;
  }

  // Sort the query params alphabetically by key for better caching
  params = Object.fromEntries(Object.entries(params).sort());

  // Create URLSearchParams object
  const searchParams = new URLSearchParams(params as any);

  // Return query params string
  return searchParams.toString();
}
