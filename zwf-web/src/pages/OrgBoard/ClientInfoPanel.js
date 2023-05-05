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
import { TimeAgo } from 'components/TimeAgo';

const { Text } = Typography;


export const ClientInfoPanel = (props) => {
  useAssertRole(['admin', 'agent']);
  const { orgClient } = props;


  const profile = orgClient?.user?.profile;

  return (
    <>
      <Descriptions column={1} bordered={false} size="small" layout="horizontal">
        <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
         <Descriptions.Item label="Invited from"><TimeAgo value={orgClient.createdAt} /></Descriptions.Item>
        {/*<Descriptions.Item label="Surname">{profile?.surname}</Descriptions.Item>
        <Descriptions.Item label="Phone">{profile?.phone}</Descriptions.Item> */}
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
