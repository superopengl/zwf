import React from 'react';
import { Form, Typography, Input } from 'antd';
import PropTypes from 'prop-types';
import { TaskTemplateFieldsEditor } from './TaskTemplateFieldsEditor';
import { TaskTemplateEditorContext } from 'contexts/TaskTemplateEditorContext';
// import { EditTitleInput } from 'components/EditTitleInput';
// import arrayMove from 'array-move';

const { Text, Paragraph } = Typography;
// Import style

export const TaskTemplateBuilder = React.forwardRef((props, ref) => {
  const { value: template, onChange } = props;

  const [allVars, setAllVars] = React.useState([]);
  const [form] = Form.useForm();

  const initialValues = {
    name: template?.name || '',
    description: template?.description || '',
    docTemplateIds: template?.docs?.map(d => d.id) || [],
    fields: template?.fields || [],
  };

  const handleValueChange = (changedValues, allValues) => {
    allValues.fields.forEach(f => {
      if (!['radio', 'checkbox', 'select'].includes(f.type)) {
        delete f.options;
      }
    })
    onChange(allValues);
  };


  return <TaskTemplateEditorContext.Provider value={{ vars: allVars }}>
    <Form
      ref={ref}
      form={form}
      // layout="vertical"
      onKeyPress={e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          return false;
        }
        return true;
      }}
      colon={false}
      onValuesChange={handleValueChange}
      noValidate
      initialValues={initialValues}
    // id={formId}
    >
      <Form.Item
        label="Description"
        name="description"
        // {...formItemLayoutProps}
        rules={[{ required: false, message: ' ' }]}>
        <Input.TextArea
          placeholder="Task template description"
          autosize={{ minRows: 2, maxRows: 6 }}
          maxLength={1000}
          allowClear
          showCount
          rows={5}
        />
      </Form.Item>
      {/* <Form.Item
        label="Doc templates"
        name="docTemplateIds"
        {...formItemLayoutProps}
      >
        <DocTemplateSelect showVariables={true} onVariableChange={hanldeVariableChange} />
      </Form.Item> */}
      {/* <Form.Item
        label="Has attachments?"
        valuePropName="checked"
        {...formItemLayoutProps}
      >
        <Switch />
      </Form.Item> */}
      <Form.Item
        // label="Fields"
        name="fields"
        // {...formItemLayoutProps}
        // labelCol={{ span: 0 }}
        // wrapperCol={{ span: 24 }}
        labelAlign='left'
        rules={[
          {
            required: true,
            message: 'Please add fields'
            // validator: async (rule, value, callback) => {
            //   debugger
            //   if (!checkRequiredFields(value)) {
            //     throw new Error(
            //       'All fields are required.'
            //     );
            //   }
            //   if (!checkOptions(value)) {
            //     throw new Error(
            //       'Please provide options for questions. All options require names.'
            //     );
            //   }
            // },
          },
        ]}>
        <TaskTemplateFieldsEditor />
      </Form.Item>
      {/* <Form.Item>
        <Button htmlType="submit">Save</Button>
      </Form.Item> */}
    </Form>
  </TaskTemplateEditorContext.Provider>
});

TaskTemplateBuilder.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired
};

TaskTemplateBuilder.defaultProps = {
};
