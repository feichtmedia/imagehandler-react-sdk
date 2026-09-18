"use client";

import React, { useContext } from "react";
import { ConfigurationContext } from "../ImageHandlerContext/context";
import { ConfigurationContextType, ImageFilterType } from "../../types";
import { checkFiletype, logOnce, prepareSrc } from "../../utils/general";
import { collapseFilterAliases } from "../../utils/filter-mapper";
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

    // Fallback if config context is missing or has no endpoint domain
    if (!config || !config.endpointDomain) {
      logOnce(
        "error",
        `ImageHandler: Please make sure a configuration context is provided and the ImageHandler component is used inside a configuration context.`
      );
      return null;
    }

    // Prepare src
    const preparedSrc: string = prepareSrc(src);

    // Fallback if the src is missing or contains no usable path segment.
    // Without this the component would request the bare endpoint domain.
    if (preparedSrc === "") {
      logOnce(
        "error",
        `ImageHandler: Failed rendering the image. The 'src' prop must be a non-empty relative image path.`
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

    // If SVGs should not be optimized by config,
    // check if the image is an SVG and if so, return it without optimization
    if (config.optimizeSvg === false && checkFiletype(src, "svg")) {
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
    if (config.optimizeGif === false && checkFiletype(src, "gif")) {
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

    // Join the global filters with the user's filters (user's filters have
    // priority). The `greyscale` / `grayscale` alias is collapsed first, so a
    // per-image value overrides a global one across both spellings.
    const joinedFilters: ImageFilterType = {
      ...collapseFilterAliases(config.globalFilters),
      ...collapseFilterAliases(filter),
    };

    // Get src-set. An empty string would render as `srcSet=""`, so it is
    // normalized to `undefined` instead.
    const generatedSrcSet: string = hasSrcSet
      ? generateSrcSet(
          srcSetSizes || config.srcSetSizes,
          width,
          objectFit,
          joinedFilters,
          preparedSrc,
          config
        )
      : "";
    const srcSet: string | undefined = generatedSrcSet || undefined;

    // Get default fallback image
    const defaultImage: string = generateImgSrc(
      width,
      height,
      objectFit,
      joinedFilters,
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

    if (config.progressiveImageLoading) {
      // Get progressive blur image
      const blurImage: string = generateImgSrc(
        40,
        0,
        "cover",
        {
          blur: 5,
          quality: 100,
          stripExif: true, // Remove metadata for smaller filesize
          stripIcc: true, // Remove metadata for smaller filesize
        },
        preparedSrc,
        config,
        false // These filters are added by the SDK, so do not warn the consumer about them
      );

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

ImageComponent.displayName = "ImageHandler";

export default ImageComponent;
