import React from 'react';
import { Modal, Typography, Input, Row, Space, Avatar, Button, Form } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { changeTaskStatus$, getTaskDeepLinkUrl, notifyTask$, renameTask$, requestClientAction$ } from 'services/taskService';
import { ClickToCopyTooltip } from '../components/ClickToCopyTooltip';
import Icon, { NotificationOutlined, ShareAltOutlined } from '@ant-design/icons';
import { MdDriveFileRenameOutline } from 'react-icons/md'
import { combineLatest } from 'rxjs';
import { Checkbox } from 'antd';
import styled from 'styled-components';

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
    debugger;
    requestClientAction$(id, values)
      .subscribe({
        next: onOk,
      });

    // const message$ = notifyTask$(id, values.message);
    // const status$ = changeTaskStatus$(id, 'action_required');
    // combineLatest([message$, status$]).subscribe(() => {
    //   onOk();
    // })
  }

  return <Container>
    <Paragraph>Send notification to client for more information. Optionally, you can also leave additional message.</Paragraph>
    <Form
      ref={formRef}
      initialValues={{ name }}
      onFinish={handleSendNotification}
      style={{ marginTop: 20 }}
    >
      <Form.Item name="requestSign" valuePropName="checked">
        <Checkbox>Request to sign documents</Checkbox>
      </Form.Item>
      <Form.Item name="requestForm" valuePropName="checked">
        <Checkbox>Request to fill the form (for information capture)</Checkbox>
      </Form.Item>
      <Form.Item name="comment" rules={[{ required: false, max: 1000, message: ' ', whitespace: false }]}>
        <Input.TextArea
          placeholder="Leave additional comments"
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
      title: <Space>
        <Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#0FBFC4' }} />
        Request client's actions
      </Space>,
      content: <Content id={taskId} onOk={() => {
        modalRef.destroy();
        onOk?.();
      }} />,
      afterClose: () => {
      },
      className: 'modal-hide-footer',
      icon: null,
      width: 500,
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      focusTriggerAfterClose: true,
      autoFocusButton: null,
    });
  }

  return [open, contextHolder];
}
