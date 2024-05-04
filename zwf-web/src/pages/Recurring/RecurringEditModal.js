import { Button, Form, Select, Space, Typography, InputNumber, Modal, Switch } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
// import 'pages/AdminTask/node_modules/react-chat-elements/dist/main.css';

import { listTaskTemplate } from 'services/taskTemplateService';
import { getRecurring$, saveRecurring$ } from 'services/recurringService';
import styled from 'styled-components';
import * as moment from 'moment';
import { DateInput } from 'components/DateInput';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import { ClientSelect } from 'components/ClientSelect';
import { Input } from 'antd';

const { Paragraph } = Typography;

const EMPTY_RECURRING = {
  name: 'Unnamed recurring',
}


const RecurringEditModal = (props) => {
  const { id: propId, visible, onOk, onCancel } = props;
  // const { name, id, fields } = value || {};
  const [id, setId] = React.useState(propId);
  const isNew = !id;
  const [recurring, setRecurring] = React.useState(EMPTY_RECURRING);
  const [loading, setLoading] = React.useState(true);
  const formRef = React.createRef()

  React.useEffect(() => {
    setId(propId);
    if (propId) {
      setLoading(true)
      const sub$ = getRecurring$(propId).subscribe(item => {
        setRecurring(item);
        setLoading(false)
      })
      return () => sub$.unsubscribe();
    } else {
      setLoading(false)
    }
  }, [propId]);

  const handleSaveRecurring = async (values) => {
    const recurring = {
      id,
      ...values
    }

    saveRecurring$(recurring).subscribe(() => {
      onOk();
    });
  }

  const handleOk = () => {
    formRef.current.submit();
  }

  return <Modal
    title={isNew ? 'New Schedular' : 'Edit Schedular'}
    visible={visible}
    closable={true}
    maskClosable={false}
    destroyOnClose={true}
    onOk={handleOk}
    onCancel={onCancel}
    okText="Save"
    cancelButtonProps={{ type: 'text' }}
  >
    {!loading && <Form
      layout="vertical"
      onFinish={handleSaveRecurring}
      ref={formRef}
      initialValues={recurring}>
      <Space direction="vertical" size="small">
        <Paragraph type="secondary">The recurring will happen at 5:00 am (Sydney time) on the specified day.</Paragraph>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: ' ' }]}>
          <Input autoFocus allowClear />
        </Form.Item>
        <Form.Item label="Client" name="clientId" rules={[{ required: true, message: ' ' }]}>
          <ClientSelect style={{ width: '100%' }} valueProp="id" />
        </Form.Item>
        <Form.Item label="Task Template" name="taskTemplateId" rules={[{ required: true, message: ' ' }]}>
          <TaskTemplateSelect />
        </Form.Item>
        <Form.Item
          label="Start On (First Run)" name="firstRunOn"
          extra="If chosse 29, 30, or 31, system will calculate the closest date in future month. For example, if starting on Jan 31 and repeat monthly, next recurring will be on Feb 28."
          rules={[{
            required: true, message: ' ', validator: async (rule, value) => {
              if (!value || !moment(value).isValid()) {
                throw new Error();
              }
            }
          }]}
        >
          <DateInput placeholder="DD/MM/YYYY" style={{ display: 'block' }} />
        </Form.Item>
        <Form.Item
          label="Repeat Every" name="every" rules={[{ required: true, message: ' ' }]}
        // help={`Preview: ${cornPreview}`}
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          <InputNumber min={1} max={52} />
        </Form.Item>
        <Form.Item
          label="Repeat Period" name="period" rules={[{ required: true, message: ' ' }]}
        // help={`Preview: ${cornPreview}`}
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          <Select>
            <Select.Option value="year">Yearly</Select.Option>
            <Select.Option value="month">Monthly</Select.Option>
            <Select.Option value="week">Weekly</Select.Option>
            <Select.Option value="day">Daily</Select.Option>
          </Select>
        </Form.Item>
        {/* <Form.Item style={{ marginTop: '1rem' }}>
          <Button type="primary" block htmlType="submit" disabled={loading} >Save</Button>
        </Form.Item> */}
      </Space>
    </Form>}
  </Modal>;
};

RecurringEditModal.propTypes = {
  id: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

RecurringEditModal.defaultProps = {
  visible: false,
};

export default RecurringEditModal;
