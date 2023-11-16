import React, { createRef, useEffect } from "react";
import Layout, { SectionContainer } from "./Layout";
import {
  getImgSrcSet,
  ImageHandler,
} from "@feichtmedia/imagehandler-react-sdk";

interface AppProps {}

const App: React.FunctionComponent<AppProps> = () => {
  // Get Image URL
  const srcSet = getImgSrcSet(
    "/99999/99999-12-20201021_luca-bravo-zAjdgNXsMeg-unsplash.jpg",
    undefined,
    undefined,
    undefined,
    [10, 20]
  );

  // Ref to image item
  const imageItemRef = createRef<HTMLImageElement>();
  useEffect(() => {
    console.log(imageItemRef.current?.src);
  }, [imageItemRef.current]);

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
          alt="Demo Image"
          title="Demo Image"
          src="/99999/99999-12-20201021_luca-bravo-zAjdgNXsMeg-unsplash.jpg"
          filter={{ blur: undefined }}
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

        <h2>Example without Lazy Loading</h2>
        <ImageHandler
          width={1280}
          src="/99999/20201222-15-blog-dark-mode_titelbild.jpg"
          hasSrcSet
          lazyLoading={false}
        />

        <Spacer height="100vh" />

        <h2>GIF example</h2>
        <ImageHandler
          width={1280}
          src="/99999/20230505-092354-block-logo.gif"
          hasSrcSet
          alt="Alt Text"
          title="Title"
        />

        <Spacer height="100vh" />

        <h2>Watermark Example</h2>
        <ImageHandler
          ref={imageItemRef}
          alt="Demo Image"
          title="Demo Image"
          src="/99999/99999-12-20201021_luca-bravo-zAjdgNXsMeg-unsplash.jpg"
          filter={{
            blur: 0,
            watermark: {
              key: "/99999/20221120-171024-wordmarkblueresp.svg",
              x: 1920 / 2 - (1920 * 0.2) / 2, // 50% of width - 50% of watermark width (watermark is 20% of image width)
              y: 1920 * 0.02,
              hRatio: 20,
            },
          }}
          width={1920}
          lazyLoading={false}
        />

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
