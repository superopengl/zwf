import { Form, Input, Card, Space, Collapse, Button, Drawer } from 'antd';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { RawHtmlDisplay } from 'components/RawHtmlDisplay';
import { extractVarsFromDocTemplateBody } from 'util/extractVarsFromDocTemplateBody';
import { renderDocTemplateBodyWithVarBag } from 'util/renderDocTemplateBodyWithVarBag';
import { isEmpty } from 'lodash';
import { CaretRightOutlined, RightOutlined } from '@ant-design/icons';

const Container = styled(Space)`
  margin: 0;
  width: 100%;
  // max-width: 600px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


const PreviewDocContainer = styled(Card)`
// background-color: rgba(0,0,0,0.05);
// padding: 0;
// margin-top: 20px;
box-shadow: 0 5px 10px rgba(0,0,0,0.1);
// border-color: #0FBFC4;
`;


const getPendingVarBag = (html, seedVarBag) => {
  const { vars } = extractVarsFromDocTemplateBody(html);
  const varBag = vars.reduce((bag, varName) => {
    bag[varName] = seedVarBag?.[varName] ?? '';
    return bag;
  }, {});

  return varBag;
}

export const DocTemplatePreviewPanel = props => {
  const { value: docTemplate, varBag: propVarBag, allowTest } = props;

  const [varBag, setVarBag] = React.useState(getPendingVarBag(docTemplate?.html, propVarBag));
  const [html, setHtml] = React.useState(docTemplate?.html);
  const [renderedHtml, setRenderedHtml] = React.useState();
  const [showTestFields, setShowTestFields] = React.useState(false);
  const form = React.createRef();

  React.useEffect(() => {
    setHtml(docTemplate?.html);
    setVarBag(getPendingVarBag(docTemplate?.html, propVarBag));
  }, [docTemplate, propVarBag])

  React.useEffect(() => {
    const newVarBag = getPendingVarBag(html, varBag);
    const renderedHtml = renderDocTemplateBodyWithVarBag(html, newVarBag);

    setRenderedHtml(renderedHtml);
  }, [html, varBag]);

  const handleVarValueChange = (changedValue, allValues) => {
    setVarBag({ ...allValues });
  }

  const shouldShowTestPanel = allowTest && !isEmpty(varBag)

  return (
    <Container style={props.style} direction="vertical" size="large">
      {/* <Paragraph type="warning" style={{textAlign: 'center'}}>Preview</Paragraph> */}
      {shouldShowTestPanel && <Button onClick={() => setShowTestFields(true)}>Test fields <RightOutlined /></Button>}

      <PreviewDocContainer bordered>
        <RawHtmlDisplay value={renderedHtml} />
      </PreviewDocContainer>

      {shouldShowTestPanel && <Drawer
        title="Input field valus"
        open={showTestFields}
        onClose={() => setShowTestFields(false)}
        destroyOnClose={false}
        // mask={false}
        maskStyle={{backgroundColor: 'transparent'}}
        push={380}
        width={400}
        // footer={<Button onClick={() => setShowTestFields(false)} type="primary">Apply</Button>}
      >
        <Form
          style={{ marginTop: 20 }}
          ref={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          onValuesChange={handleVarValueChange}
        >
          {Object.entries(varBag).map(([k]) => <Form.Item key={k} label={k} name={k}>
            <Input placeholder={`Value of ${k}`} />
          </Form.Item>)}
          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button htmlType="button" onClick={() => setShowTestFields(false)} type="primary">Apply</Button>
            {/* <Button htmlType="reset">Reset</Button> */}
          </Form.Item>
        </Form>
      </Drawer>}
    </Container >
  );
};

DocTemplatePreviewPanel.propTypes = {
  value: PropTypes.shape({
    html: PropTypes.string.isRequired,
    refFieldNames: PropTypes.arrayOf(PropTypes.string),
  }),
  varBag: PropTypes.object,
  allowTest: PropTypes.bool,
};

DocTemplatePreviewPanel.defaultProps = {
  varBag: {},
  allowTest: false,
};

