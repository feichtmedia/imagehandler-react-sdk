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
  convolution?: ConvolutionFilterType;
  crop?: CropFilterType;
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
type ConvolutionFilterType = {
  /** The convolution matrix, row by row. Its length must be divisible by `columns`. */
  matrix: number[];
  /** Number of columns of the matrix, which determines its shape. */
  columns: number;
  /** Whether the resulting image is normalized. Defaults to `false`. */
  normalize?: boolean;
};
type CropFilterType = {
  /** Distance of the crop window's left edge from the left of the source image. */
  left: number;
  /** Distance of the crop window's top edge from the top of the source image. */
  top: number;
  /** Distance of the crop window's right edge from the left of the source image. */
  right: number;
  /** Distance of the crop window's bottom edge from the top of the source image. */
  bottom: number;
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
