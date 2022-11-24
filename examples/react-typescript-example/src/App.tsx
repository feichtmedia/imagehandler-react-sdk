import React from "react";
import Layout, { SectionContainer } from "./Layout";

interface AppProps {}

const App: React.FunctionComponent<AppProps> = () => {
  return (
    <Layout pageTitle="ImageHandler React Component Demo">
      <SectionContainer title="Test">
        <p>Hello World</p>
        Env: {process.env.REACT_APP_TEST_ENV}
      </SectionContainer>
    </Layout>
  );
};

export default App;
