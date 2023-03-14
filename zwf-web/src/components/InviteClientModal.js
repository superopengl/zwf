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
      <Paragraph>
        By inputting your client's email addresses, you can invite them to join your organization, regardless of whether they already have ZeeWorkflow accounts. If your client does have an existing ZeeWorkflow account, you can immediately start serving and communicating with them. 
      <Paragraph>
        
      </Paragraph>
        For clients without ZeeWorkflow accounts, the system will automatically send them an invitation and guide them through the registration process. Once they have completed registration, you can then serve and communicate with them using ZeeWorkflow.
      </Paragraph>
      <Form
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
      </Form>
    </Loading>
  </Modal>
};

