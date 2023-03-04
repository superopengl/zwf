import React from 'react';
import { Modal } from 'antd';
import { Loading } from 'components/Loading';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import { saveOrgPaymentMethod$ } from 'services/orgPaymentMethodService';

export const useAddPaymentMethodModal = () => {
  const [loading, setLoading] = React.useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const open = (onOk) => {

    const handleSavePayment = async (stripePaymentMethodId) => {
      saveOrgPaymentMethod$(stripePaymentMethodId)
        .subscribe(() => {
          modalInstance.destroy();
          onOk?.();
        });
    }

    const modalInstance = modal.info({
      icon: null,
      title: 'Add Payment Method',
      maskClosable: false,
      closable: !loading,
      destroyOnClose: true,
      width: 460,
      zIndex: 1050,
      content: <Loading loading={loading}>
        <StripeCardPaymentWidget
          onOk={handleSavePayment}
          onLoading={loading => setLoading(loading)}
          buttonText="Add this card"
        />
      </Loading>,
      footer: null,
    })
  }

  return [open, contextHolder];
};


