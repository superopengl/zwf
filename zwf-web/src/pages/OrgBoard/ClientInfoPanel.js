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
import { InviteClientInput } from 'components/InviteClientInput';

const { Paragraph, Text } = Typography;


export const ClientInfoPanel = (props) => {
  useAssertRole(['admin', 'agent']);
  const { orgClient, onInviteFinish } = props;
  const [loading, setLoading] = React.useState(true);
  const ref = React.useRef();

  const handleSubmit = (values) => {
    const { email } = values;
    setLoading(true)
    saveOrgClientEmail$(orgClient.id, email)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe({
        next: () => {
          notify.success(
            'Client invitation sent out',
            <>Successfully sent out invitation to email client <Text code>{email}</Text></>,
          )
        },
        error: () => { },
      });
  }

  const profile = orgClient?.user?.profile;

  return (
    <>
      <Descriptions column={1} bordered={false} size="small" layout="horizontal">
        <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
        <Descriptions.Item label="Given Name">{profile?.givenName}</Descriptions.Item>
        <Descriptions.Item label="Surname">{profile?.surname}</Descriptions.Item>
        <Descriptions.Item label="Phone">{profile?.phone}</Descriptions.Item>
      </Descriptions>
    </>
  )
}

ClientInfoPanel.propTypes = {
  orgClient: PropTypes.object,
  onInviteFinish: PropTypes.func,
};

ClientInfoPanel.defaultProps = {
  onInviteFinish: () => { },
};
