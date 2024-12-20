"use client";

import React, { useContext } from "react";
import { ConfigurationContext } from "../ImageHandlerContext/context";
import { ConfigurationContextType, ImageFilterType } from "../../types";
import { mapFilterObjectToUrl } from "../../utils/filter-mapper";
import { checkFiletype, prepareSrc } from "../../utils/general";
import { generateImgSrc } from "../../utils/generate-img-src";
import { generateSrcSet } from "../../utils/generate-src-set";

interface ImageComponentProps
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  src: string;
  width?: number;
  height?: number;
  htmlWidth?: number;
  htmlHeight?: number;
  hasSrcSet?: boolean;
  srcSetSizes?: number[];
  objectFit?: "cover" | "contain";
  filter?: ImageFilterType;
  lazyLoading?: boolean;
  placeholder?: string; // Fixes issue where a prop `placeholder` is required
}

const ImageComponent = React.forwardRef<HTMLImageElement, ImageComponentProps>(
  (
    {
      src,
      width = 0,
      height = 0,
      htmlWidth,
      htmlHeight,
      objectFit = "cover",
      hasSrcSet = false,
      srcSetSizes,
      filter,
      lazyLoading = true,
      ...props
    }: ImageComponentProps,
    ref
  ) => {
    // Use global configuration
    const config: ConfigurationContextType = useContext(ConfigurationContext);

    // Fallback if config context is missing
    if (!config || config.endpointDomain === "") {
      console.error(
        `ImageHandler: Please make sure a configuration context is provided and the ImageHandleer component is used inside a configuration context.`
      );
      return null;
    }

    // Merge default styles with user's styles from props
    const styleObject: React.CSSProperties = {
      width: config.defaultStyles?.fullWidth ? "100%" : undefined,
      color: config.defaultStyles?.transparentAltText
        ? "transparent"
        : undefined,
      ...props.style,
    };

    // Prepare src
    const preparedSrc: string = prepareSrc(src);

    // If SVGs should not be optimized by config,
    // check if the image is an SVG and if so, return it without optimization
    if (config.optimizeSvg === false && checkFiletype(preparedSrc, "svg")) {
      const svgImageRequest = generateImgSrc(
        undefined,
        undefined,
        "cover",
        undefined,
        preparedSrc,
        config
      );

      return (
        <img
          {...props}
          ref={ref}
          src={svgImageRequest}
          width={htmlWidth}
          height={htmlHeight}
          loading={lazyLoading === false ? undefined : "lazy"}
          style={styleObject}
        />
      );
    }

    // If GIFs should not be optimized by config,
    // check if the image is an GIF and if so, return it without optimization
    if (config.optimizeGif === false && checkFiletype(preparedSrc, "gif")) {
      const gifImageRequest = generateImgSrc(
        undefined,
        undefined,
        "cover",
        undefined,
        preparedSrc,
        config
      );

      return (
        <img
          {...props}
          ref={ref}
          src={gifImageRequest}
          width={htmlWidth}
          height={htmlHeight}
          loading={lazyLoading === false ? undefined : "lazy"}
          style={styleObject}
        />
      );
    }

    // Map filters to URL string (pass global filters and user's filters as override)
    const filterUrl: string =
      mapFilterObjectToUrl({ ...config.globalFilters, ...filter }) || "";

    // Get src-set
    const srcSet: string | undefined = hasSrcSet
      ? generateSrcSet(
          srcSetSizes || config.srcSetSizes,
          width,
          objectFit,
          filterUrl,
          preparedSrc,
          config
        )
      : undefined;

    // Get default fallback image
    const defaultImage: string = generateImgSrc(
      width,
      height,
      objectFit,
      filterUrl,
      preparedSrc,
      config
    );

    // Return image without lazy loading if the user does not want to lazy load the image
    if (lazyLoading === false) {
      return (
        <img
          {...props}
          ref={ref}
          src={defaultImage}
          width={htmlWidth}
          height={htmlHeight}
          srcSet={srcSet}
          style={styleObject}
        />
      );
    }

    // Get progressive blur image
    const blurImage: string = generateImgSrc(
      40,
      0,
      "cover",
      mapFilterObjectToUrl({
        blur: 5,
        quality: 100,
        stripExif: true, // Remove metadata for smaller filesize
        stripIcc: true, // Remove metadata for smaller filesize
      }),
      preparedSrc,
      config
    );

    if (config.progressiveImageLoading) {
      // Image with progressive image loading
      return (
        <img
          {...props}
          ref={ref}
          src={blurImage}
          srcSet={undefined} // Will be replaced by JS
          data-src={defaultImage}
          data-srcset={srcSet}
          width={htmlWidth}
          height={htmlHeight}
          style={styleObject}
        />
      );
    } else {
      // Image without progressive image loading (uses native lazy loading)
      return (
        <img
          {...props}
          ref={ref}
          src={defaultImage}
          srcSet={srcSet}
          width={htmlWidth}
          height={htmlHeight}
          loading="lazy"
          style={styleObject}
        />
      );
    }
  }
);

export default ImageComponent;
