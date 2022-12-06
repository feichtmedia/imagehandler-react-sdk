/**
 * This file contains helper functions for the user to generate for example a image source without using the React component.
 */

import { useContext } from "react";
import { ConfigurationContext } from "../components/ImageHandlerContext/context";
import { ConfigurationContextType, ImageFilterType } from "../types";
import { mapFilterObjectToUrl } from "./filter-mapper";
import { prepareSrc } from "./general";
import { generateImgSrc } from "./generate-img-src";
import { generateSrcSet } from "./generate-src-set";

/**
 * This function allows to generate a image src outside of the `ImageHandler` component.
 * @param src Relative image src
 * @param width Width of the optimized image
 * @param height Height of the optimized image
 * @param filter Object of filters that should be applied
 * @param objectFit Fill mode of the original image in the optimized image's container size
 * @returns Image request URL
 */
export function getImgSrc(
  src: string,
  width: number | string = 0,
  height: number | string = 0,
  filter: ImageFilterType | undefined = undefined,
  objectFit: "cover" | "contain" = "cover"
): string {
  // Get global config context
  const configContext: ConfigurationContextType | undefined =
    useContext(ConfigurationContext);

  // Fallback if config context is missing
  if (!configContext || configContext.endpointDomain === "") {
    console.error(
      `ImageHandler: Failed generating a image src. Please make sure a configuration context is provided and the function is used inside a configuration context.`
    );
    return "";
  }

  // Map filters to URL string if filters where provided
  const filterUrl: string = filter ? mapFilterObjectToUrl(filter) : "";

  // Prepeare image src string
  const preparedImageSrc: string = prepareSrc(src);

  // Call main function to generate a image src
  const imageSrc: string = generateImgSrc(
    width,
    height,
    objectFit,
    filterUrl,
    preparedImageSrc,
    configContext
  );

  // Return image src
  return imageSrc;
}

/**
 * This function allows to generate a image src-set outside of the `ImageHandler` component.
 * @param src Relative image src
 * @param maxImageWidth Max. image width
 * @param filter Object of filters that should be applied
 * @param objectFit Fill mode of the original image in the optimized image's container size
 * @param sizes Array of sizes to generate the src-set for
 * @returns Image request src-set
 */
export function getImgSrcSet(
  src: string,
  maxImageWidth: number = 0,
  filter: ImageFilterType | undefined = undefined,
  objectFit: "cover" | "contain" = "cover",
  sizes: number[] | undefined = [480, 768, 992, 1280, 1920, 2048, 3840]
): string {
  // Get global config context
  const configContext: ConfigurationContextType | undefined =
    useContext(ConfigurationContext);

  // Fallback if config context is missing
  if (!configContext || configContext.endpointDomain === "") {
    console.error(
      `ImageHandler: Failed generating a image src-set. Please make sure a configuration context is provided and the function is used inside a configuration context.`
    );
    return "";
  }

  // Map filters to URL string if filters where provided
  const filterUrl: string = filter ? mapFilterObjectToUrl(filter) : "";

  // Prepeare image src string
  const preparedImageSrc: string = prepareSrc(src);

  // Call main function to generate a src set
  const imageSrcSet: string = generateSrcSet(
    sizes || configContext.srcSetSizes,
    maxImageWidth,
    objectFit,
    filterUrl,
    preparedImageSrc,
    configContext
  );

  // Return image src set
  return imageSrcSet;
}
