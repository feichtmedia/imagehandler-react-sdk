import React, { useEffect } from "react";
import { ImageHandlerContext } from "@feichtmedia/imagehandler-react-component";

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const Layout: React.FunctionComponent<LayoutProps> = ({
  children,
  pageTitle,
}) => {
  // useEffect(() => {
  //   // Call Lazy Loading here ...
  //   console.log("mounted");
  // }, []);

  return (
    <ImageHandlerContext
      config={{
        endpointDomain: "images.feicht.media",
      }}
    >
      <main>
        <BoxedContainer>
          {pageTitle && <h1 style={{ marginBottom: 20 }}>{pageTitle}</h1>}
          {children}
        </BoxedContainer>
      </main>
    </ImageHandlerContext>
  );
};
export default Layout;

// ---------- Sub-Component for Boxed Container ----------
interface BoxedContainerProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  children?: React.ReactNode;
}
export const BoxedContainer: React.FunctionComponent<BoxedContainerProps> = ({
  children,
}) => {
  return (
    <div style={{ width: "100%", maxWidth: 960, margin: "0 auto" }}>
      {children}
    </div>
  );
};

// ---------- Sub-Component for Section Container ----------

interface SectionContainerProps {
  children?: React.ReactNode;
  title?: string;
}
export const SectionContainer: React.FunctionComponent<
  SectionContainerProps
> = ({ children, title }) => {
  return (
    <div style={{ marginBottom: 100 }}>
      {title && <h2 style={{ marginBottom: 30 }}>{title}</h2>}
      {children}
    </div>
  );
};
