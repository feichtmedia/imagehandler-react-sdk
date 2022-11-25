import React from "react";
import { ConfigurationContextType } from "../../types";
import { ConfigurationContext } from "./context";

interface ImageHandlerContextProps {
  children?: React.ReactNode;
  config: ConfigurationContextType;
}

const ImageHandlerContext: React.FunctionComponent<
  ImageHandlerContextProps
> = ({ config, children }) => {
  const contextValues: ConfigurationContextType = {
    // Default Values
    useHttps: true,
    srcSetSizes: [480, 768, 992, 1200, 1920, 2048, 3840],
    optimizeSvg: false,
    progressiveImageLoading: true,
    // User's configuration
    ...config,
  };

  return (
    <ConfigurationContext.Provider value={contextValues}>
      {children}
    </ConfigurationContext.Provider>
  );
};

export default ImageHandlerContext;
