import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Form, Divider } from 'antd';
import FormBuilder from 'antd-form-builder'
import { DocTemplateListPanel } from 'components/DocTemplateListPanel';
import { convertTaskTemplateFieldsToFormFieldsSchema } from 'util/convertTaskTemplateFieldsToFormFieldsSchema';

const { Title, Text, Paragraph } = Typography;

export const TaskFormWidget = React.memo(React.forwardRef((props, ref) => {

  const { fields, docs, type, onChange } = props;

  const clientFieldSchema = React.useMemo(() => {
    const schema = convertTaskTemplateFieldsToFormFieldsSchema(fields, false);
    schema.fields.forEach(f => {
      f.required = false;
    });
    return schema;
  }, [fields]);

  const agentFieldSchema = React.useMemo(() => {
    return type == 'agent' ? convertTaskTemplateFieldsToFormFieldsSchema(fields, true) : null;
  }, [fields, type]);

  const showDocs = docs?.length > 0;
  const showOfficialFields = agentFieldSchema?.fields?.length > 0;

  const varBag = React.useMemo(() => {
    return fields.reduce((bag, f) => {
      bag[f.var] = f.value;
      return bag;
    }, {});
  }, [fields]);

  const handleFormValueChange = (changedValues, allValues) => {
    fields.forEach(f => {
      f.value = allValues[f.name];
    })

    onChange([...fields]);
  }

  return (
    <Form
      ref={ref}
      onValuesChange={handleFormValueChange}
      layout="horizontal"
      colon={false}
    >
      <Title level={5} type="secondary" style={{ marginTop: 20 }}>Client fields</Title>
      <Paragraph type="secondary">
        You can prefill some fileds on behalf of the client if you already have some of the information for this task.
      </Paragraph>
      <Divider style={{ marginTop: 4 }} />
      <FormBuilder meta={clientFieldSchema} form={ref} />
      {showDocs && <>
        <Title level={5} type="secondary" style={{ marginTop: 20 }}>Docs</Title>
        <Paragraph type="secondary">
          Variables <Text code>{'{{varName}}'}</Text> will be replaced by the corresponding form field values.
        </Paragraph>
        <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
          <DocTemplateListPanel value={docs} allowTest={false} varBag={varBag} showWarning={true} />
        </Form.Item>
      </>}
      {showOfficialFields && <>
        <Title level={5} type="secondary" style={{ marginTop: 40 }}>Official only fields</Title>
        <Paragraph type="secondary">
          These fields are not visible to clients.
        </Paragraph>
        <Divider style={{ marginTop: 4 }} />
        <FormBuilder meta={agentFieldSchema} form={ref} />
      </>}
    </Form>
  );
}));

TaskFormWidget.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  docs: PropTypes.arrayOf(PropTypes.object),
  readonly: PropTypes.bool,
  type: PropTypes.oneOf(['agent', 'client']),
  onChange: PropTypes.func,
};

TaskFormWidget.defaultProps = {
  readonly: false,
  type: 'agent',
  onChange: (fields) => { },
};

