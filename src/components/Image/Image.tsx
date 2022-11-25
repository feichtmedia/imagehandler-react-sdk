import React, { useContext } from "react";
import { ConfigurationContext } from "../ImageHandlerContext/context";
import { ConfigurationContextType, ImageFilterType } from "../../types";
import { mapFilterObjectToUrl } from "../../utils/filter-mapper";
import { checkFiletype, prepareSrc } from "../../utils/general";
import { generateImgSrc } from "../../utils/generate-img-src";

interface ImageComponentProps
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {
  src: string;
  width?: number;
  height?: number;
  hasSrcSet?: boolean;
  objectFit?: "cover" | "contain";
  placeholder?: "blur";
  filter?: ImageFilterType;
}

const ImageComponent: React.FunctionComponent<ImageComponentProps> = ({
  src,
  width = 0,
  height = 0,
  objectFit = "cover",
  hasSrcSet = false,
  placeholder,
  filter,
  ...props
}) => {
  // Use global configuration
  const config: ConfigurationContextType = useContext(ConfigurationContext);

  // Merge default styles with user's styles from props
  const styleObject: React.CSSProperties = {
    width: config.defaultStyles?.fullWidth ? "100%" : undefined,
    color: config.defaultStyles?.transparentAltText ? "transparent" : undefined,
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
      "",
      preparedSrc,
      config
    );

    return (
      <img
        {...props}
        src={svgImageRequest}
        loading="lazy"
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

  // Map filters to URL string
  const filterUrl: string = mapFilterObjectToUrl(filter);

  // Get src-set
  // ...

  // Get default fallback image
  const defaultImage: string = generateImgSrc(
    width,
    height,
    objectFit,
    filterUrl,
    preparedSrc,
    config
  );

  if (config.progressiveImageLoading) {
    // Image with progressive image loading
    return (
      <img
        {...props}
        src={blurImage}
        srcSet={undefined}
        data-src={defaultImage}
        data-srcSet={undefined}
        style={styleObject}
      />
    );
  } else {
    // Image without progressive image loading (uses native lazy loading)
    return (
      <img
        {...props}
        src={defaultImage}
        srcSet={undefined}
        loading="lazy"
        style={styleObject}
      />
    );
  }
};

export default ImageComponent;
