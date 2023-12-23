import { Form, Typography, Modal } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { listOrgExistingClients } from 'services/orgService';
import ClientSelect from './ClientSelect';
import ClientAutoComplete from './ClientAutoComplete';
const { Text, Paragraph } = Typography;

const TaskClientSelectModal = (props) => {
  const { value, onOk, onCancel, visible } = props;
  const [form] = Form.useForm();

  const handleOk = async () => {
    form.submit();
  }

  const handleCreateTask = (values) => {
    const { client } = values;
    onOk(client);
  }

  return (
    <Modal
      title="Select a client to create task for"
      visible={visible}
      maskClosable={false}
      destroyOnClose={true}
      closable={true}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Create Task"
    >
      <Paragraph type="secondary">
        Select an existing client or input new client's email address.
      </Paragraph>
      <Form form={form} onFinish={handleCreateTask} initialValues={{ client: value }}>
        <Form.Item name="client" rules={[{ required: true, message: 'Must be an email address', type: 'email' }]}>
          <ClientAutoComplete style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  )
};

TaskClientSelectModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  value: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
};

TaskClientSelectModal.defaultProps = {
  visible: false,
  onOk: () => { },
  onCancel: () => { },
};

export default TaskClientSelectModal;
