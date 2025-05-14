import React from "react";

export const PdfViewerComponent = (props) => {
  const { document } = props;
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const container = containerRef.current;
    let instance, PSPDFKit;
    (async function () {
      PSPDFKit = await import("pspdfkit");
      PSPDFKit.unload(container)

      const baseUrl = `${window.location.protocol}//${window.location.host}/${process.env.PUBLIC_URL}`;

      const pdfResponse = await fetch('http://localhost:6004/api/v1/task/file/9733ddbe-0847-432e-95b2-a219e1d91eb0', { credentials: 'include' });
      const documentBuffer = await pdfResponse.arrayBuffer();

      instance = await PSPDFKit.load({
        // Container where PSPDFKit should be mounted.
        container,
        // The document to open.
        document: documentBuffer,
        // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
        baseUrl,
        // baseUrl: `${process.env.PUBLIC_URL}`
      });
    })();

    return () => PSPDFKit && PSPDFKit.unload(container);
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
  );
}