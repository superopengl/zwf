import React from 'react';
import { Modal, Typography, Input, Row, Col, Button, Form } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { getTaskDeepLinkUrl, renameTask$ } from 'services/taskService';
import { ClickToCopyTooltip } from './ClickToCopyTooltip';
import Icon, { ShareAltOutlined } from '@ant-design/icons';
import {MdDriveFileRenameOutline} from 'react-icons/md'

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
        <Input autoFocus allowClear/>
      </Form.Item>
    </Form>
    <Row justify="end">
      <Button type="primary" onClick={() => formRef.current.submit()}>Save</Button>
    </Row>
  </>
}

export function showRenameTaskModal(id, oldName, onOk) {
  const modalRef = Modal.info({
    title: <>Rename task</>,
    content: <Content id={id} name={oldName} onOk={() => {
      modalRef.destroy();
      onOk();
    }} />,
    afterClose: () => {
    },
    icon: <Icon component={() => <MdDriveFileRenameOutline />} />,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    footer: null,
    focusTriggerAfterClose: true,
    okText: 'Done',
    autoFocusButton: null,
    okButtonProps: {
      style: {
        display: 'none'
      }
    }
  });

  return modalRef;
}
