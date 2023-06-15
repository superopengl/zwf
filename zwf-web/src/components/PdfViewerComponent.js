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

      // const pdfResponse = await fetch('http://localhost:6004/api/v1/task/file/6a26c143-6a33-43c7-ab35-65c989d74126', { credentials: 'include' });
      // const documentBuffer = await pdfResponse.arrayBuffer();

      instance = await PSPDFKit.load({
        // Container where PSPDFKit should be mounted.
        container,
        // The document to open.
        // document: documentBuffer,
        document,
        // Use the public directory URL as a base URL. PSPDFKit will download its library assets from here.
        baseUrl,
        // baseUrl: `${process.env.PUBLIC_URL}`
        toolbarItems: [
          ...PSPDFKit.defaultToolbarItems,
          { type: "content-editor" },
        ],
        // annotationToolbarColorPresets: ({
        //   defaultAnnotationToolbarColorPresets
        // }) => {
        //   debugger;
        //   const customColorPresets = defaultAnnotationToolbarColorPresets.pop();
        //   return { presets: customColorPresets };
        // },
        styleSheets: [
          './pspdfkit.css'
        ]
      });

      const widget = new PSPDFKit.Annotations.WidgetAnnotation({
        pageIndex: 0,
        boundingBox: new PSPDFKit.Geometry.Rect({
          left: 200,
          top: 300,
          width: 250,
          height: 150
        }),
        formFieldName: "My signature form field",
        id: PSPDFKit.generateInstantId()
      });
      const formField = new PSPDFKit.FormFields.SignatureFormField({
        name: "My signature form field",
        annotationIds: PSPDFKit.Immutable.List([widget.id])
      });
      instance.create([widget, formField]);
      // PSPDFKit.I18n.messages.en.sign = "initials";
      // const items = instance.toolbarItems;
    })();

    return () => PSPDFKit && PSPDFKit.unload(container);
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100vh" }} />
  );
}