import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Form, Divider } from 'antd';
import FormBuilder from 'antd-form-builder'
import { DocTemplateListPanel } from 'components/DocTemplateListPanel';
import { convertFormSchemaFromFields } from 'util/convertFormSchemaFromFields';
import { TaskAttachmentPanel } from './TaskAttachmentPanel';
import { GlobalContext } from '../contexts/GlobalContext';

const { Title, Text, Paragraph } = Typography;

export const TaskFormWidget = React.memo(React.forwardRef((props, ref) => {

  const { fields, type, onChange, disabled } = props;
  const context = React.useContext(GlobalContext);
  const role = context.role;

  fields.sort((a, b) => a.ordinal - b.ordinal);

  const isClient = role === 'client';

  const clientFieldSchema = React.useMemo(() => {
    const schema = convertFormSchemaFromFields(fields, false);
    schema?.fields?.forEach(f => {
      // f.required = false;
      f.disabled = disabled;
    });
    return schema;
  }, [fields, disabled]);

  const agentFieldSchema = React.useMemo(() => {
    const schema = type == 'agent' ? convertFormSchemaFromFields(fields, true) : null;
    schema?.fields?.forEach(f => {
      f.disabled = disabled;
    });
    return schema;
  }, [fields, type, disabled]);

  const showOfficialFields = agentFieldSchema?.fields?.length > 0;

  const varBag = React.useMemo(() => {
    return fields.reduce((bag, f) => {
      bag[f.varName] = {
        value: f.value,
        fieldName: f.name,
      }
      return bag;
    }, {});
  }, [fields]);

  const handleFormValueChange = (changedValues, allValues) => {
    onChange(changedValues);
  }

  return (
    <Form
      ref={ref}
      onValuesChange={handleFormValueChange}
      // onFieldsChange={handleFieldsChange}
      layout="horizontal"
      colon={false}
    >
      {type !== 'client' && <Divider style={{ marginTop: 4 }} orientation="left" orientationMargin="0">Client fields</Divider>}
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

TaskFormWidget.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['agent', 'client']),
  onChange: PropTypes.func,
};

TaskFormWidget.defaultProps = {
  readonly: false,
  disabled: false,
  type: 'agent',
  onChange: (fieldId, newValue) => { },
};

