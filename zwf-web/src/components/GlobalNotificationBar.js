import React from 'react';
import { message, Typography, Button, Space } from 'antd';
import { listOrgPaymentMethods$ } from 'services/orgPaymentMethodService';
import { useAddPaymentMethodModal } from './useAddPaymentMethodModal';
import { delay } from 'rxjs';

const { Link } = Typography;

const MESSAGE_KEY = 'no-payment-method-notification';

export const GlobalNotificationBar = () => {
  const [messageApi, messageContextHolder] = message.useMessage();
  const [openAddPaymentModal, modalContextHolder] = useAddPaymentMethodModal();

  React.useEffect(() => {
    const $sub = listOrgPaymentMethods$()
      .pipe(
        delay(4000)
      )
      .subscribe(list => {
        if (!list.length) {
          showNotification();
        }
      });

    return () => $sub.unsubscribe();
  }, []);

  const showNotification = () => {
    messageApi.warning({
      key: MESSAGE_KEY,
      // icon: <ExclamationCircleOutlined />,
      className: 'global-notification-bar',
      content: <Space>
        To ensure the success of your business, please <Link strong onClick={handleAddPaymentMethod}>add a payment method</Link> as soon as possible, as none has been specified.
        <Button type="primary" onClick={handleAddPaymentMethod}>Add Payment Method</Button>
      </Space>,
      duration: 0,
    })
  }

  const handleAddPaymentMethod = () => {
    openAddPaymentModal(() => {
      messageApi.destroy(MESSAGE_KEY)
    })
  }

  return <>
    {messageContextHolder}
    {modalContextHolder}
  </>;
};


