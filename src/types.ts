/**
 * Configuration of global context
 */
export type ConfigurationContextType = {
  endpointDomain: string;
  useHttps?: boolean;
  srcSetSizes?: number[];
  optimizeSvg?: boolean;
  optimizeGif?: boolean;
  progressiveImageLoading?: boolean;
  defaultStyles?: {
    fullWidth?: boolean;
    transparentAltText?: boolean;
  };
  globalFilters?: ImageFilterType;
};

/**
 * Image Optimization Filters
 */
export type ImageFilterType = {
  backgroundColor?: HEX | string;
  blur?: number;
  fill?: HEX | string;
  equalize?: boolean;
  noUpscale?: boolean;
  grayscale?: boolean;
  quality?: number;
  rgb?: [number, number, number];
  rotate?: number;
  upscale?: boolean;
  // watermark?: {
  //   key: string;
  //   xPos: number;
  //   yPos: number;
  //   alpha: number;
  //   width?: number;
  //   height?: number;
  // };
  stripExif?: boolean;
  stripIcc?: boolean;
  customFilter?: string;
};

/**
 * Custom single types
 */
// Hex Color
type HEX = `#${string}`;
