import { Form, Select, Typography, InputNumber, Modal, Alert, DatePicker } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
// import 'pages/AdminTask/node_modules/react-chat-elements/dist/main.css';

import { getRecurring$, saveRecurring$ } from 'services/recurringService';
import { FemplateSelect } from 'components/FemplateSelect';
import { Input } from 'antd';
import dayjs from 'dayjs';
import { OrgClientSelect } from 'components/OrgClientSelect';
import { RecurringPeriodInput } from 'components/RecurringPeriodInput';

const { Paragraph } = Typography;


const OrgClientSelectFormWrapper = (props, ref) => {
  const { onChange, ...others } = props;

  const handleChange = clientId => {
    onChange(clientId);
  }

  return <OrgClientSelect {...others} style={{ width: '100%' }} onChange={handleChange} />
}

const disabledPastDate = (current) => {
  // Can not select days before today and today
  return current && current.endOf('day').isBefore();
};

export const RecurringForm = React.forwardRef((props, ref) => {
  const { recurring, onDone } = props;

  return <Form
    layout="vertical"
    preserve={false}
    ref={ref}
    onFinish={onDone}
    initialValues={recurring}>
    <Form.Item label="Name" name="name" rules={[{ required: true, message: ' ' }]}>
      <Input autoFocus allowClear />
    </Form.Item>
    <Form.Item label="Client" name="orgClientId" rules={[{ required: true, message: ' ' }]}>
      <OrgClientSelectFormWrapper />
    </Form.Item>
    <Form.Item label="Form Builder" name="femplateId" rules={[{ required: true, message: ' ' }]}>
      <FemplateSelect />
    </Form.Item>
    <Form.Item
      label="Start On (First Run)" name="firstRunOn"
      extra="If you select either 29, 30, or 31, the system will determine the nearest date in the upcoming month or year. For instance, if the starting date is January 31 and the recurrence is monthly, the subsequent occurrence will be on February 28."
      rules={[{
        required: true, type: 'object', message: ' ', validator: async (rule, value) => {
          if (!value.isValid()) {
            throw new Error('Invalid date');
          }
        }
      }]}
    >
      <DatePicker disabledDate={disabledPastDate} format="D MMM YYYY" />
    </Form.Item>
    <Form.Item
      label="Repeating"
      name="repeating"
      rules={[{
        required: true,
        type: 'array',
        message: ' ',
        validator: async (rule, value) => {
          if (!(value[0] && value[1])) {
            throw new Error('Invalid repeating');
          }
        }
      }]}
    >
      <RecurringPeriodInput style={{width: 180}}/>
    </Form.Item>
  </Form>
});

RecurringForm.propTypes = {
  recurring: PropTypes.object,
  onDone: PropTypes.func,
};

RecurringForm.defaultProps = {
  onDone: () => { },
};

