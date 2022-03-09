import React from 'react';
import { Modal, Space, Avatar, Button, Form, Input } from 'antd';
import { TagsOutlined, UserAddOutlined } from '@ant-design/icons';
import { inviteClient$ } from 'services/authService';

export const InviteClientModal = props => {
  const { visible, onOk, onCancel } = props;
  const shouldAnother = React.useRef(false);
  const hasInvited = React.useRef(false);
  const ref = React.useRef();

  React.useEffect(() => {
    shouldAnother.current = false;
    hasInvited.current = false;
  }, [visible]);

  const handleInvite = () => {
    shouldAnother.current = false;
    ref.current.submit();
  }

  const handleInviteAndAnother = () => {
    shouldAnother.current = true;
    ref.current.submit();
  }

  const handleFormSubmit = (values) => {
    const { email } = values;
    inviteClient$(email).subscribe(() => {
      hasInvited.current = true;
      if (shouldAnother.current) {
        // Create another
        ref.current.resetFields();
      } else {
        // Close the modal
        onOk();
      }
    })
  }

  const handleCancel = () => {
    if (hasInvited.current) {
      onOk()
    } else {
      onCancel()
    }
  }

  return <Modal
    visible={visible}
    onCancel={handleCancel}
    onOk={onOk}
    title={<Space><Avatar icon={<UserAddOutlined />} style={{ backgroundColor: '#37AFD2' }} />Invite Client</Space>}
    closable
    destroyOnClose={true}
    maskClosable
    footer={<Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <Button type="text" onClick={handleCancel}>Cancel</Button>
      <Space>

        <Button type="primary" onClick={handleInviteAndAnother}>Invite & Another</Button>
        <Button type="primary" onClick={handleInvite}>Invite</Button>
      </Space>
    </Space>}
  >
    <Form
      ref={ref}
      layout="vertical"
      onFinish={handleFormSubmit}
    >
      <Form.Item name="email" label="Client email address" rules={[{ required: true, whitespace: false, type: 'email' }]}>
        <Input autoFocus allowClear placeholder="Client's email address" />
      </Form.Item>
    </Form>
  </Modal>
};

//   const modalRef = Modal.info({
//     title: <>Set tags</>,
//     content: <Content onClose={() => modalRef.destroy()} />,
//     afterClose: () => {
//     },
//     icon: <TagsOutlined />,
//     closable: true,
//     maskClosable: true,
//     destroyOnClose: true,
//     focusTriggerAfterClose: true,
//     okButtonProps: {
//       style: {
//         display: 'none'
//       }
//     },
//   });

//   return modalRef;
// }
