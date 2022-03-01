import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Form, Divider } from 'antd';
import FormBuilder from 'antd-form-builder'
import { DocTemplateListPanel } from 'components/DocTemplateListPanel';
import { convertTaskTemplateFieldsToFormFieldsSchema } from 'util/convertTaskTemplateFieldsToFormFieldsSchema';
import { TaskAttachmentPanel } from './TaskAttachmentPanel';

const { Title, Text, Paragraph } = Typography;

export const TaskFormWidget = React.memo(React.forwardRef((props, ref) => {

  const { fields, taskDocIds, type, onChange } = props;

  const clientFieldSchema = React.useMemo(() => {
    const schema = convertTaskTemplateFieldsToFormFieldsSchema(fields, false);
    // schema.fields.forEach(f => {
    //   f.required = false;
    // });
    return schema;
  }, [fields]);

  const agentFieldSchema = React.useMemo(() => {
    return type == 'agent' ? convertTaskTemplateFieldsToFormFieldsSchema(fields, true) : null;
  }, [fields, type]);

  const showDocs = taskDocIds?.length > 0;
  const showOfficialFields = agentFieldSchema?.fields?.length > 0;

  const varBag = React.useMemo(() => {
    return fields.reduce((bag, f) => {
      bag[f.varName] = f.value;
      return bag;
    }, {});
  }, [fields]);

  const handleFormValueChange = (changedValues, allValues) => {
    fields.forEach(f => {
      f.value = allValues[f.name];
    })

    onChange([...fields], taskDocIds);
  }

  const handleTaskDocIdsChange = ids => {
    onChange(fields, ids);
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
      <Title level={5} type="secondary" style={{ marginTop: 20 }}>Attachments</Title>
      <Form.Item wrapperCol={{ span: 24, offset: 0 }}>
        <TaskAttachmentPanel value={taskDocIds} allowTest={false} varBag={varBag} showWarning={true} onChange={handleTaskDocIdsChange}/>
      </Form.Item>
      {showDocs && <>
        <Title level={5} type="secondary" style={{ marginTop: 20 }}>Docs</Title>
        <Paragraph type="secondary">
          Variables <Text code>{'{{varName}}'}</Text> will be replaced by the corresponding form field values.
        </Paragraph>
        <Form.Item wrapperCol={{ span: 16, offset: 8 }}>
          <DocTemplateListPanel value={taskDocIds} allowTest={false} varBag={varBag} showWarning={true} />
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
  taskDocIds: PropTypes.arrayOf(PropTypes.string),
  readonly: PropTypes.bool,
  type: PropTypes.oneOf(['agent', 'client']),
  onChange: PropTypes.func,
};

TaskFormWidget.defaultProps = {
  readonly: false,
  type: 'agent',
  onChange: (fields) => { },
};

