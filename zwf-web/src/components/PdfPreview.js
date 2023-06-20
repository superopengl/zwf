import React from "react";
import { pdfjs, Document, Page } from 'react-pdf';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import { Loading } from "./Loading";

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

export const PdfPreview = (props) => {
  const { file, thumbnail, showPages } = props;

  const [numPages, setNumPages] = React.useState(1);
  const [pageNumber, setPageNumber] = React.useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(thumbnail ? 1 : numPages);
  }

  const pages = React.useMemo(() => {
    const pageComponents = [];
    for (let i = 1; i <= numPages; i++) {
      pageComponents.push(<Page
        key={i}
        pageNumber={i}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        scale={thumbnail  ? 1 : 2}
      />)
    }
    return pageComponents;
  }, [numPages]);

  return (
    <Container>
      <div className="page">
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} noData={null} loading={null}>
          {pages}
        </Document>
      </div>
      {showPages && <div className="page-numbers">
        <Text>
          <small>
            {numPages} pages
          </small>
        </Text>
      </div>}
    </Container >
  );
}

PdfPreview.propTypes = {
  file: PropTypes.any.isRequired,
  thumbnail: PropTypes.bool,
  showPages: PropTypes.bool,
};

PdfPreview.defaultProps = {
  thumbnail: false,
  showPages: false,
};