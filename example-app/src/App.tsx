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

        <p>Hello World</p>
        <Image alt="Demo Image" title="Ein wunderschönes Bild" />

        {/*
         *
         */}
      </SectionContainer>
    </Layout>
  );
};

export default App;
