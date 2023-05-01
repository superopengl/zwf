import { Button } from 'antd';
import React from 'react';
import { useAssertRole } from 'hooks/useAssertRole';
import { Drawer, Form, Typography, Input, Descriptions } from 'antd';
import PropTypes from 'prop-types';
import { ClientNameCard } from 'components/ClientNameCard';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { Loading } from 'components/Loading';
import { getOrgClientDatabag$, getOrgClientInfo$, saveOrgClientEmail$ } from 'services/clientService';
import { notify } from 'util/notify';

const { Paragraph, Text } = Typography;


export const ClientInfoDrawer = (props) => {
  useAssertRole(['admin', 'agent']);
  const { id, open, onClose } = props;
  const [loading, setLoading] = React.useState(true);
  const [orgClient, setOrgClient] = React.useState();
  const ref = React.useRef();

  React.useEffect(() => {
    if (!id) {
      setOrgClient(false);
      return;
    }
    const sub$ = getOrgClientInfo$(id)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(setOrgClient);

    return () => sub$.unsubscribe()
  }, [id])

  const handleSave = async () => {
    ref.current.submit();
  }

  const handleSubmit = (values) => {
    const { email } = values;
    setLoading(true)
    saveOrgClientEmail$(orgClient.id, email)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe({
        next: () => {
          onClose()
          notify.success(
            'Client invitation sent out',
            <>Successfully sent out invitation to email client <Text code>{email}</Text></>,
          )
        },
        error: () => {},
      });
  }

  const isZwfAccount = !!orgClient?.email;

  return (
    <Drawer
      open={open}
      closable={false}
      onClose={onClose}
      title={<ClientNameCard id={orgClient?.id} allowChangeAlias={true} />}
      destroyOnClose
      placement='right'
      // footer={!isZwfAccount && <Button type="primary" onClick={handleSave}>Save</Button>}
      bodyStyle={{ padding: 0 }}
    >
      <Loading loading={loading}>
        <ProCard
          title={isZwfAccount ? "Client information" : "Invite Client to ZeeWorkflow"}
        >
          {isZwfAccount ? <>
            <Descriptions column={1} bordered={false} size="small" layout="vertical">
              <Descriptions.Item label="Email">{orgClient.email}</Descriptions.Item>
              <Descriptions.Item label="Given Name">{orgClient.givenName}</Descriptions.Item>
              <Descriptions.Item label="Surname">{orgClient.surname}</Descriptions.Item>
              <Descriptions.Item label="Phone">{orgClient.phone}</Descriptions.Item>
            </Descriptions>
          </> : <>
            <Paragraph type="secondary">The client does not have a ZeeWorkflow account. Setting an email address will invite the client to join ZeeWorkflow.</Paragraph>
            <Form ref={ref} onFinish={handleSubmit}>
              <Form.Item name="email" rules={[{ required: true, type: 'email', whitespace: false, max: 100 }]}>
                <Input allowClear placeholder="Email address" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType='submit'>Invite Client</Button>
              </Form.Item>
            </Form>
          </>}
        </ProCard>
      </Loading>
    </Drawer>
  )
}

ClientInfoDrawer.propTypes = {
  id: PropTypes.string,
};

ClientInfoDrawer.defaultProps = {
};
