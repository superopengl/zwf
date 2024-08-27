import React from 'react';
import { Modal, Typography, Input, Row, Space, Avatar, Button, Form } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { getTaskDeepLinkUrl, renameTask$ } from 'services/taskService';
import { ClickToCopyTooltip } from './ClickToCopyTooltip';
import Icon, { ShareAltOutlined } from '@ant-design/icons';
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
    <Form
      ref={formRef}
      initialValues={{ name }}
      onFinish={handleRename}
      style={{ marginTop: 20 }}
    >
      <Form.Item name="name" rules={[{ required: true, max: 100, message: ' ', whitespace: false }]}>
        <Input autoFocus allowClear />
      </Form.Item>
    </Form>
    <Row justify="end" style={{ marginTop: 32 }}>
      <Button type="primary" onClick={() => formRef.current.submit()}>Save</Button>
    </Row>
  </>
}

export function showRenameTaskModal(id, oldName, onOk) {
  const modalRef = Modal.info({
    title: <>Rename task</>,
    title: <Space>
      <Avatar icon={<Icon component={MdDriveFileRenameOutline} />} style={{ backgroundColor: '#0FBFC4' }} />
      Rename task
    </Space>,
    content: <Content id={id} name={oldName} onOk={() => {
      modalRef.destroy();
      onOk();
    }} />,
    afterClose: () => {
    },
    icon: null,
    className: 'modal-hide-footer',
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    focusTriggerAfterClose: true,
    autoFocusButton: null,
  });

  return modalRef;
}
