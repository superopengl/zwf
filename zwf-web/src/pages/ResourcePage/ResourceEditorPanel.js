
import React from 'react';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography, Button, Alert, Input, Modal, Form, Tooltip, Tag, Drawer, Radio } from 'antd';
import {RichTextInput} from 'components/RichTextInput';
import { ResourcePagePictureUpload } from 'components/ResourcePagePictureUpload';

const Container = styled.div`
  margin: 0 auto 0 auto;
  padding-top: 20px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  // height: 100%;
`;


export const ResourceEditorPanel = props => {
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
        {/* <Form.Item name="keywords" label="Keywords" rules={[{ required: false, message: ' ' }]}>
          <Input allowClear placeholder="Keywords, space delimited" />
        </Form.Item> */}
        <Form.Item name="imageBase64" label="Picture" rules={[{ required: false, message: ' ' }]}>
          <ResourcePagePictureUpload />
        </Form.Item>
        <Form.Item name="html" label="Body" rules={[{ required: true, message: ' ' }]}>
          <RichTextInput />
        </Form.Item>
      </Form>
    </Container >
  );
};

ResourceEditorPanel.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
  debug: PropTypes.bool.isRequired,
};

ResourceEditorPanel.defaultProps = {
  debug: false
};

