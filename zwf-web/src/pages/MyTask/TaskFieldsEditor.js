import { Form, Input, Radio, Typography } from 'antd';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { merge } from 'lodash';
import StepButtonSet from './StepBottonSet';

const { Text } = Typography;

const TaskFieldsEditor = (props) => {
  const { task, onFinish, disabled, onBack, isActive } = props;

  const handleSubmit = async (values) => {
    const changedTask = merge({}, task, values);
    onFinish(changedTask);
  }

  if (!task || !isActive) {
    return null;
  }

  return <Form
    layout="vertical"
    onFinish={handleSubmit}
    style={{ textAlign: 'left' }}
    initialValues={task}
  >
    {task.fields.filter(field => !field.officialOnly).map((field, i) => {
      const { name, description, type, required } = field;
      const formItemProps = {
        label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
        name: ['fields', i, 'value'],
        rules: [{ required, message: ' ' }]
      }
      const autoFocus = i === 0;
      return (
        <Form.Item key={i} {...formItemProps}>
          {type === 'text' ? <Input disabled={disabled} autoFocus={autoFocus}/> :
            type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={disabled}/> :
              type === 'monthRange' ? <RangePickerInput picker="month" disabled={disabled}/> :
                type === 'number' ? <Input disabled={disabled} type="number" pattern="[0-9.]*" autoFocus={autoFocus}/> :
                  type === 'paragraph' ? <Input.TextArea disabled={disabled} autoFocus={autoFocus}/> :
                    type === 'date' ? <DateInput picker="date" disabled={disabled} placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="DD/MM/YYYY"/> :
                      type === 'select' ? <Radio.Group disabled={disabled} buttonStyle="solid" autoFocus={autoFocus}>
                        {field.options?.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                      </Radio.Group> :
                        <Text danger>Unsupported field type '{type}'</Text>}
        </Form.Item>
      );
    })}
      {/* <Space style={{ width: '100%' }}>
        <Button onClick={() => onBack()}>Back</Button>
        <Button onClick={() => onSkip()}>Skip</Button>
        <Button type="primary" htmlType="submit">Next</Button>
      </Space> */}
      <StepButtonSet onBack={onBack} />
  </Form>
};

TaskFieldsEditor.propTypes = {
  task: PropTypes.any.isRequired,
  disabled: PropTypes.bool.isRequired,
};

TaskFieldsEditor.defaultProps = {
  disabled: false
};

export default withRouter(TaskFieldsEditor);
