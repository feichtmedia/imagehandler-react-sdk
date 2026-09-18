"use client";

import React from "react";
import { ConfigurationContextType } from "../../types";
import { ConfigurationContext } from "./context";
import { logOnce } from "../../utils/general";

interface ImageHandlerContextProps {
  children?: React.ReactNode;
  config: ConfigurationContextType;
}

/**
 * Copy an object without the keys that are explicitly set to `undefined`.
 *
 * Spreading the user's config over the defaults would otherwise let an
 * `undefined` value overwrite a default — for `useHttps` that silently
 * downgrades every image request from HTTPS to HTTP.
 * @param source Object to copy
 * @returns Copy of the object without `undefined` values
 */
function withoutUndefined<T extends object>(source: T | undefined): Partial<T> {
  const result: Partial<T> = {};

  if (!source) return result;

  (Object.keys(source) as (keyof T)[]).forEach((key) => {
    if (source[key] !== undefined) result[key] = source[key];
  });

  return result;
}

const ImageHandlerContext: React.FunctionComponent<
  ImageHandlerContextProps
> = ({ config, children }) => {
  const contextValues: ConfigurationContextType = React.useMemo(() => {
    // Fallback if no configuration was passed at all
    if (!config) {
      logOnce(
        "error",
        `ImageHandler: Failed reading the configuration. Please pass a 'config' object with at least an 'endpointDomain' to 'ImageHandlerContext'.`
      );
    }

    return {
      // Default Values
      endpointDomain: "",
      useHttps: true,
      useQueryParams: false,
      srcSetSizes: [480, 768, 992, 1280, 1920, 2048, 3840],
      optimizeSvg: false,
      optimizeGif: false,
      progressiveImageLoading: true,
      // User's configuration
      ...withoutUndefined(config),
      // Default styles
      defaultStyles: {
        fullWidth: true,
        transparentAltText: true,
        // User's default styles
        ...withoutUndefined(config?.defaultStyles),
      },
    };
  }, [config]);

  return (
    <ConfigurationContext.Provider value={contextValues}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export default ImageHandlerContext;
