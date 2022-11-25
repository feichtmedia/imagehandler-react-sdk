import React from "react";
import Layout, { SectionContainer } from "./Layout";
import { Image } from "@feichtmedia/imagehandler-react-component";

interface AppProps {}

const App: React.FunctionComponent<AppProps> = () => {
  return (
    <Layout pageTitle="ImageHandler React Component Demo">
      <SectionContainer title="Test">
        {/*
         *
         */}

        <Image
          title="FeichtMedia Logo"
          src="/99999/20221120-171024-wordmarkblueresp.svg"
        />

        <p>Hello World</p>

        <Image
          alt="Demo Image"
          title="Ein wunderschönes Bild"
          src="/99999/99999-12-20200929_apple-website-bild.jpg"
          width={960}
        />

        <div
          style={{
            width: "100%",
            height: "300vh",
            background: "gray",
            margin: "30 auto",
            padding: 20,
            textAlign: "center",
            color: "white",
          }}
        >
          Spacer
        </div>

        <Image
          alt="Demo Image"
          title="Ein wunderschönes Bild"
          src="/99999/20220531-105114-demo-image-metadaten-3.jpg"
          width={960}
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

        {/*
         *
         */}
      </SectionContainer>
    </Layout>
  );
};

export default App;
