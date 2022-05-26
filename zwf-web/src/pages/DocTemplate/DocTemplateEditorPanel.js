
import React from 'react';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography, Button, Alert, Input, Modal, Form, Tooltip, Tag, Drawer, Radio } from 'antd';
import { RichTextInput } from 'components/RichTextInput';

const Container = styled.div`
  margin: 0 auto 0 auto;
  padding-top: 20px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


export const DocTemplateEditorPanel = props => {
  const { value, debug, onChange } = props;

  const [entity, setEntity] = React.useState(value);

  React.useEffect(() => {
    setEntity(value);
  }, [value])

  return (
    <Container>
      <Form
        // onFinish={handleSave} 
        layout="vertical"
        onValuesChange={(changedValues, allValues) => onChange(allValues)}
        initialValues={entity}
        style={{ position: 'relative' }}>
        <Form.Item name="html" rules={[{
          required: true, 
          message: 'Doc template content is empty',
          validator: async (rule, value) => { 
            debugger;
          }
        }]}>
          <RichTextInput />
        </Form.Item>
        {/* <Form.Item name="description" label="Notes" rules={[{ required: false, message: ' ' }]}>
          <Input.TextArea allowClear autoSize={{ minRows: 3 }} placeholder="Doc template description or extra information. This won't be display to the end clients." />
        </Form.Item> */}
      </Form>
    </Container >
  );
};

DocTemplateEditorPanel.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
  debug: PropTypes.bool.isRequired,
};

DocTemplateEditorPanel.defaultProps = {
  debug: false
};

export default DocTemplateEditorPanel;
