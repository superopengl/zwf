import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import 'pages/MyTask/node_modules/react-markdown-editor-lite/lib/index.css';
import PDFViewer from 'mgr-pdf-viewer-react';

const Container = styled.div`
  background-color: #333333;
  padding: 1rem;
  height: 300px;
  overflow-x: auto;
  overflow-y: auto;
`;

const PdfViewer = props => {
  const { data, width } = props;

  return <Container>
    {data && <PDFViewer 
    document={{ base64: data }} 
    width={width} 
    // navigation={{elements: {
    //   previousPageBtn: <Button>Pre</Button>,
    //   nextPageBtn: <Button>Next</Button>,
    // }}}
    />}
    </Container>
}

PdfViewer.propTypes = {
  data: PropTypes.any.isRequired,
};

PdfViewer.defaultProps = {
  // disabled: false
};

export default PdfViewer;