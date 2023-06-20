import React from "react";
import { pdfjs, Document, Page } from 'react-pdf';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import { Loading } from "./Loading";
import { useIntersectionObserverRef } from "rooks";
import { PdfPreview } from "./PdfPreview";
import { getDemplatePdfBuffer$ } from "services/demplateService";

const { Text } = Typography;

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const Container = styled.div`
.react-pdf__Page {
  border: 1px solid rgba(5, 5, 5, 0.06);
  // box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  // margin: 8px;
}

.page-numbers {
  text-align: right;
  margin-top: 4px;
}

.react-pdf__Document {
  overflow: hidden;
  width: 100%;
  gap: 24px;
  display: flex;
  flex-direction: column;
}

.react-pdf__Page__canvas {
  width: 100% !important;
  height: 100% !important;
}
`;

export const DemplateThumbnail = (props) => {
  const { id } = props;

  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [pdfBuffer, setPdfBuffer] = React.useState(null);

  const [ref] = useIntersectionObserverRef(entries => {
    if (entries && entries[0]) {
      setIsIntersecting(entries[0].isIntersecting);
    }
  });

  React.useEffect(() => {
    if (isIntersecting && !pdfBuffer) {
      const sub$ = getDemplatePdfBuffer$(id).subscribe(setPdfBuffer);
      return () => sub$.unsubscribe();
    }
  }, [isIntersecting])

  return (<div ref={ref}>
    {pdfBuffer && <PdfPreview file={pdfBuffer} thumbnail={true}/>}
  </div>);
}

DemplateThumbnail.propTypes = {
  id: PropTypes.string.isRequired,
};

DemplateThumbnail.defaultProps = {
};