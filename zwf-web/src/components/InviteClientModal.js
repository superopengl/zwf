import React from 'react';
import { Modal, Space, Avatar, Button, Form, Input, Typography } from 'antd';
import { TagsOutlined, UserAddOutlined } from '@ant-design/icons';
import { addClient$ } from 'services/authService';
import { finalize } from 'rxjs';
import { Loading } from 'components/Loading';
const { Text, Paragraph } = Typography;

export const InviteClientModal = props => {
  const { open, onOk, onCancel } = props;
  const hasInvited = React.useRef(false);
  const ref = React.useRef();
  const [loading, setLoading] = React.useState(false);
  const [canSubmit, setCanSubmit] = React.useState(false);

  React.useEffect(() => {
    hasInvited.current = false;
  }, [open]);

  const handleInvite = () => {
    ref.current.submit();
  }

  const handleFormSubmit = (values) => {
    const { alias, email } = values;
    setLoading(true)
    addClient$(alias, email).pipe(
      finalize(() => setLoading(false)),
    ).subscribe({
      next: (newClient) => {
        hasInvited.current = true;
        onOk(newClient.id);
      },
      error: e => { }
    })
  }

  const handleCancel = () => {
    if (hasInvited.current) {
      onOk()
    } else {
      onCancel()
    }
  }

  const handleValueChange = (changed, values) => {
    const { alias } = values;
    setCanSubmit(!!alias?.trim())
  }

  return <Modal
    open={open}
    onCancel={handleCancel}
    onOk={onOk}
    // title={<Space><Avatar icon={<UserAddOutlined />} style={{ backgroundColor: '#0FBFC4' }} />Invite Client</Space>}
    title="Add New Client"
    closable
    destroyOnClose={true}
    maskClosable={false}
    footer={<Space style={{ width: '100%', justifyContent: 'end' }}>
      {/* <Button type="text" onClick={handleCancel} disabled={loading}>Cancel</Button> */}
      <Button type="primary" onClick={handleInvite} disabled={!canSubmit || loading}>Add</Button>
    </Space>}
  >
    <Loading loading={loading} >
      <Paragraph>
        If the input email address is not an exisitng ZeeWorkflow client account, the system will automatically send them an invitation and guide them through the registration process. Once they have completed registration, you can then serve and communicate with them using ZeeWorkflow.
      </Paragraph>
      <Form
        ref={ref}
        layout="vertical"
        onFinish={handleFormSubmit}
        onValuesChange={handleValueChange}
      >
        <Form.Item name="alias" label="Client name" rules={[{ required: true, max: 50 }]}
        >
          <Input placeholder="Company ABC LTD. or Tom Jerry" autoFocus allowClear />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: false, type: 'email', max: 100 }]}
          extra="You can set email for this client later"
        >
          <Input placeholder="andy@zeeworkflow.com" allowClear />
        </Form.Item>
      </Form>
      {/* <Form
        ref={ref}
        layout="vertical"
        onFinish={handleFormSubmit}
        requiredMark={false}
      >
        <Form.Item name="emails" label="Client email addresses"
          extra='Multiple email addresses can be splitted by comma or line-break'
          rules={[{ required: true, whitespace: true, max: 1000 }]}>
          <Input.TextArea placeholder={`andy@zeeworkflow.com\nbob@zeeworkflow.com`}
            autoSize={{ minRows: 5 }}
            autoComplete="email"
            allowClear={true}
            maxLength="1000"
            autoFocus={true}
            disabled={loading} />
        </Form.Item>
      </Form> */}
    </Loading>
  </Modal>
};

