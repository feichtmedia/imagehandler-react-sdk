/**
 * Configuration of global context
 */
export type ConfigurationContextType = {
  endpointDomain: string;
  useHttps?: boolean;
  useQueryParams?: boolean;
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
  animated?: boolean;
  autojpg?: boolean;
  backgroundColor?: HEX | string;
  blur?: number;
  fill?: HEX | string;
  equalize?: boolean;
  grayscale?: boolean;
  format?: "gif" | "jpeg" | "png" | "avif" | "webp" | "tiff" | "raw" | "heif";
  noUpscale?: boolean;
  proportion?: number;
  quality?: number;
  rgb?: [number, number, number];
  rotate?: number;
  sharpen?: {
    amount: number;
    radius: number;
    luminanceOnly?: boolean;
  };
  smartCrop?: SmartCropFilterType;
  stretch?: boolean; //
  stripExif?: boolean;
  stripIcc?: boolean;
  upscale?: boolean;
  watermark?: WatermarkFilterType;
  flip?: boolean;
  flop?: boolean;
  greyscale?: boolean;
  customFilter?: string;
};

/**
 * Single filter types
 */
type WatermarkFilterType = {
  key: string;
  x: number;
  y: number;
  alpha?: number;
  wRatio?: number;
  hRatio?: number;
};
type SmartCropFilterType = {
  faceIndex?: number;
  facePadding?: number;
};

/**
 * Custom single types
 */
// Hex Color
type HEX = `#${string}`;

/**
 * Image request query parameters (interal type)
 */
export type RequestQueryParamsType = {
  format?:
    | "jpg"
    | "jpeg"
    | "heic"
    | "png"
    | "raw"
    | "tiff"
    | "webp"
    | "gif"
    | "avif";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
  width?: number;
  height?: number;
  rotate?: number;
  flip?: boolean;
  flop?: boolean;
  greyscale?: boolean;
};
