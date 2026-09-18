import { ConfigurationContextType, ImageFilterType } from "../types";
import { mapFilterObjectToUrl } from "./filter-mapper";
import {
  createQueryParams,
  normalizeEndpointDomain,
  toDimension,
} from "./general";

/**
 * Function to generate a image request URL out of multiple informations.
 * @param width Width of the optimized image
 * @param height Height of the optimized image
 * @param objectFit Fill mode of the original image in the optimized image's container size
 * @param filterObject Filter object from the `Image` component props or global config
 * @param src Prepared image source from `prepareSrc()`
 * @param config Config object from the global context
 * @param warnUnsupportedFilters Whether to warn about filters the active mode cannot express. Disabled for the filters the SDK adds itself, such as the ones of the progressive placeholder
 * @returns Image request URL
 */
export function generateImgSrc(
  width: number | string = 0,
  height: number | string = 0,
  objectFit: "cover" | "contain" = "cover",
  filterObject: ImageFilterType = {},
  src: string,
  config: ConfigurationContextType,
  warnUnsupportedFilters: boolean = true
): string {
  // Prepare the parts of the URL that both modes share.
  // `useHttps` only downgrades to plain HTTP when it is explicitly `false`, so
  // an accidental `undefined` cannot silently produce an insecure request.
  const protocol: string = config.useHttps === false ? "http" : "https";
  const endpointDomain: string = normalizeEndpointDomain(config.endpointDomain);

  // Normalize the dimensions to non-negative integers
  const preparedWidth: number = toDimension(width);
  const preparedHeight: number = toDimension(height);

  // Check if a URL using query parameters or thumbor-like URL path segments should be generated
  if (config.useQueryParams === true) {
    // ----- Create URL using query parameters

    // Create query params string
    const queryParams: string = createQueryParams(
      preparedWidth,
      preparedHeight,
      objectFit,
      filterObject,
      warnUnsupportedFilters
    );

    // Return image src
    return `${protocol}://${endpointDomain}${src}${
      queryParams ? `?${queryParams}` : ""
    }`;
  } else {
    // ----- Create URL using thumbor-like URL path segments

    // Map filters to URL string (pass global filters and user's filters as override)
    const filterUrl: string = mapFilterObjectToUrl(filterObject) || "";

    // Prepare resolution. Only added when at least one dimension is set.
    const resolution: string =
      preparedWidth > 0 || preparedHeight > 0
        ? `/${preparedWidth}x${preparedHeight}`
        : "";

    // Prepare the remaining part of the URL
    const fitIn: string = objectFit === "contain" ? "/fit-in" : "";

    // Return image src
    return `${protocol}://${endpointDomain}${resolution}${fitIn}${filterUrl}${src}`;
  }
}
