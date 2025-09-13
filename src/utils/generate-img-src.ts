import { ConfigurationContextType, ImageFilterType } from "../types";
import { mapFilterObjectToUrl } from "./filter-mapper";
import { createQueryParams } from "./general";

/**
 * Function to generate a image request URL out of multiple informations.
 * @param width Width of the optimized image
 * @param height Height of the optimized image
 * @param objectFit Fill mode of the original image in the optimized image's container size
 * @param filterObject Filter object from the `Image` component props or global config
 * @param src Prepared image source from `prepareSrc()`
 * @param config Config object from the global context
 * @returns Image request URL
 */
export function generateImgSrc(
  width: number | string = 0,
  height: number | string = 0,
  objectFit: "cover" | "contain" = "cover",
  filterObject: ImageFilterType = {},
  src: string,
  config: ConfigurationContextType
): string {
  // Check if a URL using query parameters or thumbor-like URL path segments should be generated
  if (config.useQueryParams === true) {
    // ----- Create URL using query parameters

    // Create query params string
    const queryParams: string = createQueryParams(
      Number(width),
      Number(height),
      objectFit,
      filterObject
    );

    // Prepare other parts of the URL
    const protocol: string = config.useHttps ? "https" : "http";

    // Return image src
    return `${protocol}://${config.endpointDomain}${src}${
      queryParams ? `?${queryParams}` : ""
    }`;
  } else {
    // ----- Create URL using thumbor-like URL path segments

    // Map filters to URL string (pass global filters and user's filters as override)
    const filterUrl: string = mapFilterObjectToUrl(filterObject) || "";

    // Prepare resolution
    let resolution: string = "";
    if (width || height) {
      // Prepare values to have a min. value of 0
      const w = parseInt(width.toString()) > 0 ? width : 0;
      const h = parseInt(height.toString()) > 0 ? height : 0;
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
}
