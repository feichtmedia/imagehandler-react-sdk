import React from "react";
import ReactDOM from "react-dom/client";
import { ImageHandlerContext } from "@feichtmedia/imagehandler-react-sdk";
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ImageHandlerContext
      config={{
        endpointDomain: "images.feicht.media",
        useHttps: true,
        progressiveImageLoading: false,
        defaultStyles: {
          transparentAltText: true,
          fullWidth: true,
        },
        globalFilters: {
          blur: 10,
        },
      }}
    >
      <App />
    </ImageHandlerContext>
  </React.StrictMode>
);
