import { Form, Select, Typography, InputNumber, Modal, Alert, DatePicker } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
// import 'pages/AdminTask/node_modules/react-chat-elements/dist/main.css';

import { getRecurring$, saveRecurring$ } from 'services/recurringService';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import { Input } from 'antd';
import dayjs from 'dayjs';
import { OrgClientSelect } from 'components/OrgClientSelect';

const { Paragraph } = Typography;

const EMPTY_RECURRING = {
  name: 'Unnamed recurring',
}

const OrgClientSelectFormWrapper = (props) => {
  const {onChange, ...others} = props;

  const handleChange = client => {
    onChange(client?.id);
  }

  return <OrgClientSelect {...others} style={{ width: '100%' }} onChange={handleChange}/>
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
        setRecurring({...item, firstRunOn: dayjs(item.firstRunOn)});
        setLoading(false)
      })
      return () => sub$.unsubscribe();
    } else {
      setLoading(false)
    }
  }, [propId]);

  const handleSaveRecurring = async (values) => {
    const {client, ...others} = values;
    const recurring = {
      id,
      ...others,
    }

    saveRecurring$(recurring).subscribe(() => {
      onOk();
    });
  }

  const handleOk = () => {
    formRef.current.submit();
  }

  const disabledPastDate = (current) => {
    // Can not select days before today and today
    return current && current.endOf('day').isBefore();
  };

  return <Modal
    title={isNew ? 'New Scheduler' : 'Edit Scheduler'}
    open={visible}
    closable={true}
    maskClosable={false}
    destroyOnClose={true}
    onOk={handleOk}
    onCancel={onCancel}
    okText="Save"
    cancelButtonProps={{ type: 'text' }}
  >
    {/* <Paragraph type="secondary">The recurrence is scheduled for approximately 5:00 am (AEST) on the designated day.</Paragraph> */}
    <Alert type="info" showIcon description="The recurrence is scheduled for approximately 5:00 am (AEST) on the designated day." style={{marginBottom: 20, marginTop: 20}}/>
    {!loading && <Form
      layout="vertical"
      preserve={false}
      onFinish={handleSaveRecurring}
      ref={formRef}
      initialValues={recurring}>
      <Form.Item label="Name" name="name" rules={[{ required: true, message: ' ' }]}>
        <Input autoFocus allowClear />
      </Form.Item>
      <Form.Item label="Client" name="clientId" rules={[{ required: true, message: ' ' }]}>
        <OrgClientSelectFormWrapper />
      </Form.Item>
      <Form.Item label="Form Template" name="taskTemplateId" rules={[{ required: true, message: ' ' }]}>
        <TaskTemplateSelect />
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
        <DatePicker disabledDate={disabledPastDate} format="D MMM YYYY"/>
      </Form.Item>
      <Form.Item label="Repeat Every" >
        <Form.Item name="every" rules={[{ required: true, message: ' ' }]} style={{display: 'inline-block', marginRight: 12}}
        // help={`Preview: ${cornPreview}`}
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          <InputNumber min={1} max={52} />
        </Form.Item>
        <Form.Item name="period" rules={[{ required: true, message: ' ' }]} style={{display: 'inline-block', width: 100}}
        // help={`Preview: ${cornPreview}`}
        >
          {/* <Input autoSize={{ minRows: 3, maxRows: 20 }} maxLength={20} placeholder="Type here ..." allowClear disabled={loading} /> */}
          <Select>
            <Select.Option value="year">Year</Select.Option>
            <Select.Option value="month">Month</Select.Option>
            <Select.Option value="week">Week</Select.Option>
            <Select.Option value="day">Day</Select.Option>
          </Select>
        </Form.Item>
      </Form.Item>
      {/* <Form.Item style={{ marginTop: '1rem' }}>
          <Button type="primary" block htmlType="submit" disabled={loading} >Save</Button>
        </Form.Item> */}
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
