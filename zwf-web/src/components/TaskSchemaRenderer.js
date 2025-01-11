import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Form, Divider } from 'antd';
import FormBuilder from 'antd-form-builder'
import { DocTemplateListPanel } from 'components/DocTemplateListPanel';
import { createFormSchemaFromFields, generateFormSchemaFromFields } from 'util/createFormSchemaFromFields';
import { GlobalContext } from '../contexts/GlobalContext';
import { BetaSchemaForm, ProFormSelect } from '@ant-design/pro-components';

const { Title, Text, Paragraph } = Typography;

export const TaskSchemaRenderer = React.memo(React.forwardRef((props, ref) => {

  const { fields, mode, onChange, disabled } = props;
  const context = React.useContext(GlobalContext);
  const role = context.role;

  fields.sort((a, b) => a.ordinal - b.ordinal);

  const isClient = role === 'client';

  const clientFieldSchema = React.useMemo(() => {
    const schema = generateFormSchemaFromFields(fields, false);
    schema?.fields?.forEach(f => {
      // f.required = false;
      f.disabled = disabled;
    });
    return schema;
  }, [fields, disabled]);

  const agentFieldSchema = React.useMemo(() => {
    const schema = mode === 'agent' ? generateFormSchemaFromFields(fields, true) : null;
    schema?.fields?.forEach(f => {
      f.disabled = disabled;
    });
    return schema;
  }, [fields, mode, disabled]);

  const showOfficialFields = agentFieldSchema?.fields?.length > 0;

  const handleFormValueChange = (changedValues, allValues) => {
    onChange(changedValues);
  }

  return <BetaSchemaForm 
    layoutType='Form'
    columns={clientFieldSchema}
    onValuesChange={handleFormValueChange}
  />

  return (
    <Form
      ref={ref}
      onValuesChange={handleFormValueChange}
      // onFieldsChange={handleFieldsChange}
      layout="horizontal"
      colon={false}
      // size={isClient ? 'large' : 'middle'}
    >
      {mode !== 'client' && <Divider style={{ marginTop: 4 }} orientation="left" orientationMargin="0">Client fields</Divider>}
      {!isClient && <>
        <Paragraph type="secondary">
          You can prefill some fileds on behalf of the client if you already have some of the information for this task.
        </Paragraph>
      </>}
      <FormBuilder meta={clientFieldSchema} form={ref} />
      {showOfficialFields && <>
        <Divider style={{ marginTop: 4 }} orientation="left" orientationMargin="0">Official only fields</Divider>
        <Paragraph type="secondary">
          These fields are not visible to clients.
        </Paragraph>
        <FormBuilder meta={agentFieldSchema} form={ref} />
      </>}
    </Form>
  );
}));

TaskSchemaRenderer.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  mode: PropTypes.oneOf(['agent', 'client']),
  onChange: PropTypes.func,
};

TaskSchemaRenderer.defaultProps = {
  readonly: false,
  disabled: false,
  mode: 'agent',
  onChange: (fieldId, newValue) => { },
};

