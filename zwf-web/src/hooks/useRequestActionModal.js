import React from 'react';
import { Modal, Typography, Input, Row, Button, Form } from 'antd';
import { requestClientAction$ } from 'services/taskService';
import Icon, { } from '@ant-design/icons';
import { Checkbox } from 'antd';
import styled from 'styled-components';
import { BsFillSendFill } from 'react-icons/bs';
import { TaskFieldsPreviewPanel } from 'pages/Femplate/TaskFieldsPreviewPanel';
import { TaskContext } from 'contexts/TaskContext';
import { ProCard } from '@ant-design/pro-components';
import { Divider } from 'antd';
import { notify } from 'util/notify';

const { Text, Paragraph } = Typography;

const Container = styled.div`
.ant-form-item {
  margin-bottom: 8px;
}
`;

const Content = props => {
  const { id, name, onOk } = props;
  const formRef = React.createRef();
  const { task } = React.useContext(TaskContext);

  const handleSendNotification = (values) => {
    requestClientAction$(id, values)
      .subscribe({
        next: () => {
          notify.success('Request sent out', 'Successfully sent out the request. Please wait for the client to submit the form.');
          onOk();
        }
      })
  }

  return <Container>
    <Paragraph>Inform the client to fill out the form like below.</Paragraph>
    <ProCard bordered title="Form" style={{boxShadow:'0 5px 10px rgba(0,0,0,0.3)'}}>
      <TaskFieldsPreviewPanel mode="client" fields={task.fields} />
    </ProCard>
    <Divider style={{ marginTop: 40 }} />
    <Paragraph >You may provide an additional comment along with the notification.</Paragraph>
    <Form
      ref={formRef}
      initialValues={{ name }}
      onFinish={handleSendNotification}
      
      preserve={false}
    >
      <Form.Item name="comment" rules={[{ required: false, max: 1000, message: ' ', whitespace: false }]} style={{ marginTop: 18 }}>
        <Input.TextArea
          placeholder="Additional comment"
          autoSize={{ minRows: 3 }}
          autoFocus
          allowClear
          maxLength={1000}
          showCount
        />
      </Form.Item>
    </Form>
    <Row justify="end" style={{ marginTop: 32 }}>
      <Button type="primary" onClick={() => formRef.current.submit()}>Request Client to Fill</Button>
    </Row>
  </Container>
}

export const useRequestActionModal = () => {
  const [modal, contextHolder] = Modal.useModal();

  const open = (taskId, onOk) => {
    const modalRef = modal.info({
      icon: <Icon component={BsFillSendFill} />,
      title: `Request client to fill form`,
      content: <Content id={taskId} onOk={() => {
        modalRef.destroy();
        onOk?.();
      }} />,
      afterClose: () => {
      },
      className: 'modal-hide-footer',
      // icon: null,
      width: 500,
      closable: false,
      maskClosable: true,
      destroyOnClose: true,
      focusTriggerAfterClose: true,
      autoFocusButton: null,
    });
  }

  return [open, contextHolder];
}
