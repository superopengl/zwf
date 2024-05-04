import React from 'react';
import { Modal, Typography, Input, Row, Space, Avatar, Button, Form } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { getTaskDeepLinkUrl, notifyTask$, renameTask$ } from 'services/taskService';
import { ClickToCopyTooltip } from './ClickToCopyTooltip';
import Icon, { NotificationOutlined, ShareAltOutlined } from '@ant-design/icons';
import { MdDriveFileRenameOutline } from 'react-icons/md'

const { Text, Paragraph } = Typography;

const Content = props => {
  const { id, name, onOk } = props;
  const formRef = React.createRef();

  const handleSendNotification = (values) => {
    notifyTask$(id, values.message).subscribe(() => {
      onOk();
    })
  }

  return <>
    <Paragraph>Send notification email to client for more information. Optionally, you can also leave additional message.</Paragraph>
    <Form
      ref={formRef}
      initialValues={{ name }}
      onFinish={handleSendNotification}
      style={{ marginTop: 20 }}
    >
      <Form.Item name="message" rules={[{ required: false, max: 1000, message: ' ', whitespace: false }]}>
        <Input.TextArea 
        placeholder="Leave additional message or explanation of the request."
        autoSize={{minRows: 3}}
        autoFocus 
        allowClear 
        maxLength={1000} 
        showCount 
        />
      </Form.Item>
    </Form>
    <Row justify="end" style={{marginTop: 32}}>
      <Button type="primary" onClick={() => formRef.current.submit()}>Send Notification Email</Button>
    </Row>
  </>
}

export function showRequireActionModal(taskID, onOk) {
  const modalRef = Modal.info({
    title: <Space>
      <Avatar icon={<NotificationOutlined />} style={{ backgroundColor: '#37AFD2' }} />
      Notify client
    </Space>,
    content: <Content id={taskID} onOk={() => {
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

  return modalRef;
}
