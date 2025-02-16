import React from 'react';
import { Modal, Space, Avatar, Button, Form, Input, Typography } from 'antd';
import { TagsOutlined, UserAddOutlined } from '@ant-design/icons';
import { inviteClient$ } from 'services/authService';
import { finalize } from 'rxjs';
import { Loading } from 'components/Loading';
const { Text, Paragraph } = Typography;

export const InviteClientModal = props => {
  const { open, onOk, onCancel } = props;
  const hasInvited = React.useRef(false);
  const ref = React.useRef();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    hasInvited.current = false;
  }, [open]);

  const handleInvite = () => {
    ref.current.submit();
  }

  const handleFormSubmit = (values) => {
    const { emails } = values;
    setLoading(true)
    inviteClient$(emails).pipe(
      finalize(() => setLoading(false)),
    ).subscribe(() => {
      hasInvited.current = true;
      // Close the modal
      onOk();
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
    open={open}
    onCancel={handleCancel}
    onOk={onOk}
    // title={<Space><Avatar icon={<UserAddOutlined />} style={{ backgroundColor: '#0FBFC4' }} />Invite Client</Space>}
    title="Invite Client"
    closable
    destroyOnClose={true}
    maskClosable={false}
    footer={<Space style={{ width: '100%', justifyContent: 'end' }}>
      {/* <Button type="text" onClick={handleCancel} disabled={loading}>Cancel</Button> */}
      <Button type="primary" onClick={handleInvite} disabled={loading}>Invite</Button>
    </Space>}
  >
    <Loading loading={loading} >
      <Form
        ref={ref}
        layout="vertical"
        onFinish={handleFormSubmit}
        requiredMark={false}
      >
        <Form.Item name="emails" label="Client email addresses" 
        extra='Multiple email addresses can be splitted by comma, like "andy@zeeworkflow.com, bob@zeeworkflow.com"'
        rules={[{ required: true, whitespace: true, max: 1000 }]}>
          <Input.TextArea placeholder="andy@zeeworkflow.com, bob@zeeworkflow.com"
            autoSize={{ minRows: 3 }}
            autoComplete="email"
            allowClear={true}
            maxLength="1000"
            autoFocus={true}
            disabled={loading} />
        </Form.Item>
      </Form>
    </Loading>
  </Modal>
};

