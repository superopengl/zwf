import React from 'react';
import { Modal, Typography, Input, Row, Button, Form } from 'antd';
import { requestClientAction$ } from 'services/taskService';
import Icon, {  } from '@ant-design/icons';
import { Checkbox } from 'antd';
import styled from 'styled-components';
import { BsFillSendFill } from 'react-icons/bs';

const { Text, Paragraph } = Typography;

const Container = styled.div`
.ant-form-item {
  margin-bottom: 8px;
}
`;

const Content = props => {
  const { id, name, onOk } = props;
  const formRef = React.createRef();

  const handleSendNotification = (values) => {
    requestClientAction$(id, values)
      .subscribe({
        next: onOk,
      });
  }

  return <Container>
    <Paragraph>Send notification to client for actions and if needed, include an additional comment.</Paragraph>
    <Form
      ref={formRef}
      initialValues={{ name }}
      onFinish={handleSendNotification}
      style={{ marginTop: 20 }}
      preserve={false}
    >
      <Form.Item name="requestSign" valuePropName="checked">
        <Checkbox>Request to sign documents</Checkbox>
      </Form.Item>
      <Form.Item name="requestForm" valuePropName="checked">
        <Checkbox>Request to fill the form (for information capture)</Checkbox>
      </Form.Item>
      <Form.Item name="comment" rules={[{ required: false, max: 1000, message: ' ', whitespace: false }]} style={{marginTop: 18}}>
        <Input.TextArea
          placeholder="Leave additional comment"
          autoSize={{ minRows: 3 }}
          autoFocus
          allowClear
          maxLength={1000}
          showCount
        />
      </Form.Item>
    </Form>
    <Row justify="end" style={{ marginTop: 32 }}>
      <Button type="primary" onClick={() => formRef.current.submit()}>Send</Button>
    </Row>
  </Container>
}

export const useRequestActionModal = () => {
  const [modal, contextHolder] = Modal.useModal();

  const open = (taskId, onOk) => {
    const modalRef = modal.info({
      icon: <Icon component={BsFillSendFill} />,
      title: `Request client's actions`,
      content: <Content id={taskId} onOk={() => {
        modalRef.destroy();
        onOk?.();
      }} />,
      afterClose: () => {
      },
      className: 'modal-hide-footer',
      // icon: null,
      width: 470,
      closable: false,
      maskClosable: true,
      destroyOnClose: true,
      focusTriggerAfterClose: true,
      autoFocusButton: null,
    });
  }

  return [open, contextHolder];
}
