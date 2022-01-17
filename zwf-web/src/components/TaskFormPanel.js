import { Typography, Form, Divider, Button, Space } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import FormBuilder from 'antd-form-builder'
import PropTypes from 'prop-types';
import { convertTaskTemplateFieldsToFormFieldsSchema } from '../util/convertTaskTemplateFieldsToFormFieldsSchema';

const { Title, Paragraph, Text } = Typography;


export const TaskFormPanel = React.memo(props => {

  const { value, type, debug } = props;

  const [clientFieldSchema, setClientFieldSchema] = React.useState([]);
  const [agentFieldSchema, setAgentFieldSchema] = React.useState([]);
  const previewFormRef = React.createRef();

  const officialMode = type === 'agent';

  React.useEffect(() => {
    if (!value) return;
    const clientFields = convertTaskTemplateFieldsToFormFieldsSchema(value.fields, false);
    setClientFieldSchema(clientFields);
    const agentFields = convertTaskTemplateFieldsToFormFieldsSchema(value.fields, true);
    setAgentFieldSchema(agentFields);
  }, [value]);

  if (!value) {
    return null;
  }

  const handleFormSave = (values) => {
    props.onSave(values);
  }

  const handleValuesChange = (value, allValues) => {
    debugger;
  }

  const handleFieldsChange = (changedField, allFields) => {
    debugger;
  }

  return (
    <>
      <Form
        ref={previewFormRef}
        layout="vertical"
        colon={false}
        onFinish={handleFormSave}
        onValuesChange={handleValuesChange}
        onFieldsChange={handleFieldsChange}
      >
        <FormBuilder meta={clientFieldSchema} form={previewFormRef} />
        {officialMode && <>
          <Title level={5} type="secondary" style={{ marginTop: 40 }}>Official only fields</Title>
          <Divider style={{ marginTop: 4 }} />
          <FormBuilder meta={agentFieldSchema} form={previewFormRef} />
        </>}
      </Form>
      {debug && <pre><small>{JSON.stringify(clientFieldSchema, null, 2)}</small></pre>}
    </>
  );
});

TaskFormPanel.propTypes = {
  value: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
  }),
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
  debug: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onChangeLoading: PropTypes.func,
};

TaskFormPanel.defaultProps = {
  type: 'client',
  loading: true,
  debug: false,
  onSave: () => { debugger; },
  onChangeLoading: () => {}
};

