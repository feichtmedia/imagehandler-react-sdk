import React, { useContext } from "react";
import { ConfigurationContext } from "../ImageHandlerContext/context";

interface ImageComponentProps
  extends React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > {}

const ImageComponent: React.FunctionComponent<ImageComponentProps> = ({
  ...props
}) => {
  const context = useContext(ConfigurationContext);

  return <img {...props} />;
};

export default ImageComponent;
