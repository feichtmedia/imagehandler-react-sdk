import React from "react";
import Layout, { SectionContainer } from "./Layout";
import { ImageHandler } from "@feichtmedia/imagehandler-react-sdk";

interface AppProps {}

const App: React.FunctionComponent<AppProps> = () => {
  return (
    <Layout pageTitle="ImageHandler React Component Demo">
      <SectionContainer title="Test">
        {/*
         *
         */}

        <ImageHandler
          title="FeichtMedia Logo"
          src="/99999/20221120-171024-wordmarkblueresp.svg"
        />

        <p>Hello World</p>

        <ImageHandler
          alt="Apple Bild"
          title="Apple Bild"
          src="/99999/99999-12-20200929_apple-website-bild.jpg"
          width={960}
          hasSrcSet
        />

        <Spacer height="300vh" />

        <ImageHandler
          alt="Sport Bild"
          title="Sport Bild"
          src="/99999/20220531-105114-demo-image-metadaten-3.jpg"
          width={960}
          hasSrcSet
          filter={
            {
              // backgroundColor: "#abcdef",
              // blur: 20,
              // fill: "#123456",
              // equalize: true,
              // noUpscale: true,
              // upscale: true,
              // grayscale: true,
              // quality: 10,
              // rgb: [20, -20, 255],
              // rotate: 10,
              // stripExif: true,
              // stripIcc: true,
            }
          }
        />

        <ImageHandler
          width={1280}
          src="/99999/99999-8-20200927_overview-awards-poster.jpg"
          hasSrcSet
        />

        <Spacer height="100vh" />

        {/*
         *
         */}
      </SectionContainer>
    </Layout>
  );
};

export default App;

// --------------- Sub-Component for Spacer ---------------
function Spacer({ height = "100vh" }) {
  return (
    <div
      style={{
        width: "100%",
        height: height,
        background: "gray",
        margin: "30 auto",
        padding: 20,
        textAlign: "center",
        color: "white",
      }}
    >
      Spacer
    </div>
  );
}
