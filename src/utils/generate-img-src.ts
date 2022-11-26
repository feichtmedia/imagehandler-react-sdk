import { ConfigurationContextType } from "../types";

/**
 * Function to generate a image request URL out of multiple informations.
 * @param width Width of the optimized image
 * @param height Height of the optimized image
 * @param objectFit Fill mode of the original image in the optimized image's container size
 * @param filterUrl Filter url from `mapFilterObjectToUrl()`
 * @param src Prepared image source from `prepareSrc()`
 * @param config Config object from the global context
 * @returns Image request URL
 */
export function generateImgSrc(
  width: number | string = 0,
  height: number | string = 0,
  objectFit: "cover" | "contain" = "cover",
  filterUrl: string | undefined = "",
  src: string,
  config: ConfigurationContextType
): string {
  // Prepare resolution
  let resolution: string = "";
  if (width || height) {
    // Prepare values to have a min. value of 0
    const w = width > 0 ? width : 0;
    const h = height > 0 ? height : 0;
    // Check if at least one value is greather than 0
    if (w !== 0 || h !== 0) {
      resolution = `/${w.toString() || "0"}x${h.toString() || "0"}`;
    }
  }

  // Prepare other parts of the URL
  const protocol: string = config.useHttps ? "https" : "http";
  const fitIn: string = objectFit === "contain" ? "/fit-in" : "";

  // Return image src
  return `${protocol}://${config.endpointDomain}${resolution}${fitIn}${filterUrl}${src}`;
}
