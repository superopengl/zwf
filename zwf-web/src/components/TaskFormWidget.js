import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Form, Divider } from 'antd';
import FormBuilder from 'antd-form-builder'
import { DocTemplateListPanel } from 'components/DocTemplateListPanel';
import { convertTaskTemplateFieldsToFormFieldsSchema } from 'util/convertTaskTemplateFieldsToFormFieldsSchema';
import { TaskAttachmentPanel } from './TaskAttachmentPanel';
import { GlobalContext } from '../contexts/GlobalContext';

const { Title, Text, Paragraph } = Typography;

export const TaskFormWidget = React.memo(React.forwardRef((props, ref) => {

  const { fields, taskDocIds, type, onChange, disabled } = props;
  const context = React.useContext(GlobalContext);
  const role = context.role;

  const isClient = role === 'client';

  const clientFieldSchema = React.useMemo(() => {
    const schema = convertTaskTemplateFieldsToFormFieldsSchema(fields, false);
    schema?.fields?.forEach(f => {
      // f.required = false;
      f.disabled = disabled;
    });
    return schema;
  }, [fields, disabled]);

  const agentFieldSchema = React.useMemo(() => {
    const schema = type == 'agent' ? convertTaskTemplateFieldsToFormFieldsSchema(fields, true) : null;
    schema?.fields?.forEach(f => {
      f.disabled = disabled;
    });
    return schema;
  }, [fields, type, disabled]);

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
      <Divider style={{ marginTop: 4 }} orientation="left" orientationMargin="0">{isClient ? 'Fields' : 'Client fields'}</Divider>
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
        <Divider style={{ marginTop: 4 }} />
        <FormBuilder meta={agentFieldSchema} form={ref} />
      </>}
      <Divider style={{ marginTop: 4 }} orientation="left" orientationMargin="0">Attachments</Divider>
      <Form.Item wrapperCol={{ span: 24, offset: 0 }}>
        <TaskAttachmentPanel
          value={taskDocIds}
          allowTest={false}
          varBag={varBag}
          showWarning={true}
          onChange={handleTaskDocIdsChange}
          disabled={disabled}
        />
      </Form.Item>
    </Form>
  );
}));

TaskFormWidget.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  taskDocIds: PropTypes.arrayOf(PropTypes.string),
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['agent', 'client']),
  onChange: PropTypes.func,
};

TaskFormWidget.defaultProps = {
  readonly: false,
  disabled: false,
  type: 'agent',
  onChange: (fields) => { },
};

