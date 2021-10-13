
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { TaskTemplateBuilder } from 'pages/TaskTemplate/formBuilder/TaskTemplateBuilder';
import PropTypes from 'prop-types';
import { Typography, Button, Alert, Input, Modal, Form, Tooltip, Tag, Drawer, Radio } from 'antd';
import RickTextInput from 'components/RichTextInput';

const Container = styled.div`
  margin: 0 auto 0 auto;
  // padding: 10px;
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
    onValuesChange={(changedValues, allValues) => onChange(allValues)}
    initialValues={entity}
     style={{ position: 'relative' }}>
      <Form.Item name="name" rules={[{ required: true, message: ' ', max: 100 }]}>
        <Input placeholder="Doc Template Name" />
      </Form.Item>
      <Form.Item name="description" rules={[{ required: true, message: ' ' }]}>
        <Input.TextArea allowClear autoSize={{ minRows: 3 }} placeholder="Doc template description. This will be shown on the create task wizard to help users fill required fields to generate this document." />
      </Form.Item>
      <Form.Item name="html" rules={[{ required: true, message: ' ' }]}>
       <RickTextInput />
      </Form.Item>
    </Form >
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

export default withRouter(DocTemplateEditorPanel);