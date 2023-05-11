import { Button } from 'antd';
import React from 'react';
import { useAssertRole } from 'hooks/useAssertRole';
import { Drawer, Form, Typography, Input, Descriptions, Modal } from 'antd';
import PropTypes from 'prop-types';
import { ClientNameCard } from 'components/ClientNameCard';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { Loading } from 'components/Loading';
import { getOrgClientDatabag$, getOrgClientInfo$, saveOrgClientEmail$ } from 'services/clientService';
import { notify } from 'util/notify';
import { Space } from 'antd';
import Icon, { MailOutlined } from '@ant-design/icons';
import { BsSendFill } from 'react-icons/bs';
import isEmail from 'validator/lib/isEmail';

const { Paragraph, Text } = Typography;


export const InviteClientInput = (props) => {
  useAssertRole(['admin', 'agent']);

  const { orgClientId, onFinish } = props;

  const [status, setStatus] = React.useState();
  const [email, setEmail] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (touched) {
      const isValid = isEmail(email);
      setStatus(isValid ? null : 'error');
    } else {
      setStatus(null);
    }
  }, [email, touched]);



  const handleSubmit = (email) => {
    const isValid = isEmail(email);
    if (isValid) {
      setLoading(true)
      saveOrgClientEmail$(orgClientId, email)
        .pipe(
          finalize(() => setLoading(false))
        )
        .subscribe({
          next: () => {
            notify.success(
              'Client invitation done',
              <>Successfully sent out invitation to client <Text code>{email}</Text></>,
            );
            onFinish?.();
          },
          error: () => { },
        });
    }

    setStatus(isValid ? null : 'error')
  }

  const handleChange = e => {
    setTouched(true);
    setEmail(e.target.value);
  }

  return <Space.Compact>
    <Input.Search
      status={status}
      addonBefore={<MailOutlined />}
      placeholder='client email'
      loading={loading}
      value={email}
      onChange={handleChange}
      onSearch={handleSubmit}
      enterButton={<Button type="primary" icon={<Icon component={BsSendFill} />}>Invite</Button>}
    />
  </Space.Compact>
}

