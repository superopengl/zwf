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

const { Paragraph, Text } = Typography;


export const useInviteClientModal = () => {
  useAssertRole(['admin', 'agent']);
  const [modal, contextHolder] = Modal.useModal();
  const [loading, setLoading] = React.useState(true);
  const ref = React.useRef();

  const open = ({ onOk, orgClientId } = {}) => {
    const handleSubmit = (values) => {
      const { email } = values;
      setLoading(true)
      saveOrgClientEmail$(orgClientId, email)
        .pipe(
          finalize(() => setLoading(false))
        )
        .subscribe({
          next: () => {
            notify.success(
              'Client invitation sent out',
              <>Successfully sent out invitation to email client <Text code>{email}</Text></>,
            );
            modalInstance.destroy();
            onOk?.();
          },
          error: () => { },
        });
    }

    const modalInstance = modal.info({
      icon: null,
      title: 'Invite client to ZeeWorkflow',
      content: <>
        <Form ref={ref} onFinish={handleSubmit}>
          <Form.Item name="email" rules={[{ required: true, type: 'email', whitespace: false, max: 100 }]}>
            <Input allowClear placeholder="Email address" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType='submit'>Invite Client</Button>
          </Form.Item>
        </Form>
      </>,
      maskClosable: true,
      closable: false,
      footer: null,
      destroyOnClose: true,
    })
  }

  return [open, contextHolder];
}

