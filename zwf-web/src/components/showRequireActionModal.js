import React from 'react';
import { Modal, Typography, Input, Row, Space, Avatar, Button, Form } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { getTaskDeepLinkUrl, renameTask$ } from 'services/taskService';
import { ClickToCopyTooltip } from './ClickToCopyTooltip';
import Icon, { NotificationOutlined, ShareAltOutlined } from '@ant-design/icons';
import { MdDriveFileRenameOutline } from 'react-icons/md'

const { Text, Paragraph } = Typography;

const Content = props => {
  const { id, name, onOk } = props;
  const formRef = React.createRef();

  const handleRename = (values) => {
    renameTask$(id, values.name).subscribe(() => {
      onOk();
    })
  }

  return <>
    <Paragraph>Send notification to client for more information</Paragraph>
    <Form
      ref={formRef}
      initialValues={{ name }}
      onFinish={handleRename}
      style={{ marginTop: 20 }}
    >
      <Form.Item name="name" rules={[{ required: true, max: 1000, message: ' ', whitespace: false }]}>
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
      <Button type="primary" onClick={() => formRef.current.submit()}>Send</Button>
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
      onOk();
    }} />,
    afterClose: () => {
    },
    className: 'modal-hide-footer',
    icon: null,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    focusTriggerAfterClose: true,
    autoFocusButton: null,
  });

  return modalRef;
}
