import { Form, Input, Card, Space, Row, Button, Drawer } from 'antd';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { extractVarsFromDemplateBody } from 'util/extractVarsFromDemplateBody';
import { renderDemplateBodyWithVarBag } from 'util/renderDemplateBodyWithVarBag';
import { isEmpty } from 'lodash';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { PdfViewerComponent } from './PdfViewerComponent';
import { previewDemplatePdf$ } from 'services/demplateService';
import { RawHtmlDisplay } from './RawHtmlDisplay';
import { PdfPreview } from './PdfPreview';

const Container = styled(Space)`
  margin: 0;
  width: 100%;
  // max-width: 600px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


const PreviewDocContainer = styled.div`
// background-color: rgba(0,0,0,0.05);
// padding: 0;
// margin-top: 20px;
box-shadow: 0 5px 10px rgba(0,0,0,0.1);
// border-color: #0FBFC4;
`;

const PdfPage = styled(Card)`
// padding: 40px;
color: #000000 !important;
border: none;
border-radius: 0;
// width: 2480px;
`;


const getPendingVarBag = (html, seedVarBag) => {
  const { vars } = extractVarsFromDemplateBody(html);
  const varBag = vars.reduce((bag, varName) => {
    bag[varName] = seedVarBag?.[varName] ?? '';
    return bag;
  }, {});

  return varBag;
}

export const DemplatePreviewPanel = props => {
  const { value: demplate, varBag: propVarBag, allowTest, editorElement } = props;

  const [varBag, setVarBag] = React.useState(getPendingVarBag(demplate?.html, propVarBag));
  const [html, setHtml] = React.useState(demplate?.html);
  const [renderedHtml, setRenderedHtml] = React.useState();
  const [pdfBuffer, setPdfButter] = React.useState(null);
  const [showTestFields, setShowTestFields] = React.useState(false);
  const form = React.createRef();

  React.useEffect(() => {
    setHtml(demplate?.html);
    setVarBag(getPendingVarBag(demplate?.html, propVarBag));
  }, [demplate, propVarBag])

  React.useEffect(() => {
    const newVarBag = getPendingVarBag(html, varBag);
    const renderedHtml = renderDemplateBodyWithVarBag(html, newVarBag);
    const sub$ = previewDemplatePdf$(renderedHtml).subscribe(async r => {
      const buffer = await r.arrayBuffer();
      setPdfButter(buffer);
    });

    setRenderedHtml(renderedHtml);
    return () => sub$.unsubscribe();
  }, [html, varBag]);

  React.useEffect(() => {
    // const sub$ = htmlToPdfBuffer$(document.getElementById('pdf-html-source'), demplate.name).subscribe(setPdfButter);
    // return () => sub$.unsubscribe();

  }, [demplate.name, renderedHtml])

  const handleVarValueChange = (changedValue, allValues) => {
    setVarBag({ ...allValues });
  }

  const shouldShowTestPanel = allowTest && !isEmpty(varBag)

  return (
    <Container style={props.style} direction="vertical" size="large">
      {/* <Paragraph type="warning" style={{textAlign: 'center'}}>Preview</Paragraph> */}
      {shouldShowTestPanel && <Row justify="end">
        <Button
          type="primary"
          onClick={() => setShowTestFields(true)}>Test fields <RightOutlined /></Button>
      </Row>}

      {/* <PreviewDocContainer bordered>
        <PdfPage id="pdf-html-source">
          <RawHtmlDisplay value={renderedHtml} />
        </PdfPage>
      </PreviewDocContainer> */}

      <PdfPreview file={pdfBuffer} />

      {/* <div style={{ width: '100%' }}>
        {pdfBuffer && <PdfViewerComponent document={pdfBuffer} />}
      </div> */}


      {shouldShowTestPanel && <Drawer
        title="Input field valus"
        open={showTestFields}
        onClose={() => setShowTestFields(false)}
        closeIcon={<LeftOutlined />}
        destroyOnClose={false}
        // mask={false}
        maskStyle={{ backgroundColor: 'transparent' }}
        push={380}
        width={400}
      // extra={<Button onClick={() => setShowTestFields(false)} type="primary">Apply</Button>}
      // footer={<Button onClick={() => setShowTestFields(false)} type="primary">Apply</Button>}
      >
        <Form
          style={{ marginTop: 20 }}
          ref={form}
          // labelCol={{ span: 8 }}
          // wrapperCol={{ span: 16 }}
          layout="vertical"
          onValuesChange={handleVarValueChange}
        >
          {Object.entries(varBag).map(([k]) => <Form.Item key={k} label={k} name={k}>
            <Input placeholder={`Value of ${k}`} />
          </Form.Item>)}
          {/* <Form.Item >
            <Button htmlType="button" onClick={() => setShowTestFields(false)} type="primary">Apply</Button>
          </Form.Item> */}
        </Form>
      </Drawer>}
    </Container >
  );
};

DemplatePreviewPanel.propTypes = {
  value: PropTypes.shape({
    html: PropTypes.string.isRequired,
    refFieldNames: PropTypes.arrayOf(PropTypes.string),
  }),
  varBag: PropTypes.object,
  allowTest: PropTypes.bool,
};

DemplatePreviewPanel.defaultProps = {
  varBag: {},
  allowTest: false,
};

