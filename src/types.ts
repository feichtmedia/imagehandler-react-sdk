/**
 * Configuration of global context
 */
export type ConfigurationContextType = {
  endpointDomain: string;
  useHttps?: boolean;
  srcSetSizes?: number[];
  optimizeSvg?: boolean;
  progressiveImageLoading?: boolean;
  defaultStyles?: {
    fullWidth?: boolean;
    transparentAltText?: boolean;
  };
};

/**
 * Image Optimization Filters
 */
export type ImageFilterType = {
  backgroundColor?: HEX;
  blur?: number;
  fill?: HEX;
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
