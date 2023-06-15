import React from 'react';
import { Form, Typography, Input } from 'antd';
import { isEmpty } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { FieldList } from './FieldList';
// import arrayMove from 'array-move';

const {Paragraph} = Typography;
// Import style

export const createEmptyField = () => {
  return {
    id: uuidv4(),
    widget: 'input',
    label: '',
    extra: '',
  }
}

const checkLabels = items => {
  return items.every(x => x.label && x.widget);
};

const checkOptions = items => {
  for (let i = 0; i < items.length; i += 1) {
    const currQuestion = items[i];
    if (
      currQuestion.widget === 'radio' ||
      currQuestion.widget === 'checkbox' ||
      currQuestion.widget === 'select'
    ) {
      const currOptions = currQuestion.options;
      if (currOptions.length === 0) {
        return false;
      }

      for (let j = 0; j < currOptions.length; j += 1) {
        if (currOptions[j].value === '') {
          return false;
        }
      }
    }
  }
  return true;
};

export const TaskTemplateBuilder = (props) => {
  const { value: template, onChange } = props;

  const initialValues = {
    name: template?.name || '',
    description: template?.description || '',
    fields: isEmpty(template?.fields) ? [createEmptyField()] : template.fields
  };

  const handleValueChange = (changedValues, allValues) => {
    allValues.fields.forEach(f => {
      if(!['radio', 'checkbox', 'select'].includes(f.type)) {
        delete f.options;
      }
    })
    onChange(allValues);
  };

  return <>
    <Form
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
        name="name"
        rules={[{ required: true, message: ' ' }]}>
        <Input placeholder="Task template name" />
      </Form.Item>
      <Form.Item
        name="description"
        rules={[{ required: false, message: ' ' }]}>
        <Input.TextArea
          placeholder="Task template description"
          autosize={{ minRows: 2, maxRows: 6 }}
        />
      </Form.Item>
      <Paragraph type="secondary">
        Drag and drop field cards to adjust the order.
      </Paragraph>
      <Form.Item name="fields" noStyle rules={[
        {
          required: true,
          validator: async (rule, value, callback) => {
            if (!checkLabels(value)) {
              throw new Error(
                'All fields are required.'
              );
            }
            if (!checkOptions(value)) {
              throw new Error(
                'Please provide options for questions. All options require names.'
              );
            }
          },
        },
      ]}>
        <FieldList />
      </Form.Item>
      {/* <Form.Item>
        <Button htmlType="submit">Save</Button>
      </Form.Item> */}
    </Form>
  </>
}

TaskTemplateBuilder.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired
};

TaskTemplateBuilder.defaultProps = {
};
