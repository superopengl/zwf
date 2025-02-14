import React from 'react';
import { Modal } from 'antd';
import { Loading } from 'components/Loading';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import { saveOrgPaymentMethod$ } from 'services/orgPaymentMethodService';
import { getPaymentMethodSecret$ } from 'services/orgPaymentMethodService';
import { firstValueFrom, map } from 'rxjs';

export const useAddPaymentMethodModal = () => {
  const [loading, setLoading] = React.useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const open = (onOk) => {

    const handleSavePayment = (stripePaymentMethodId) => {
      saveOrgPaymentMethod$(stripePaymentMethodId)
        .subscribe(() => {
          modalInstance.destroy();
          onOk?.();
        });
    }

    const handleGetClientSecret = () => {
      const source$ = getPaymentMethodSecret$().pipe(
        map(result => result.clientSecret)
      );
      return firstValueFrom(source$);
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
          onClientSecret={handleGetClientSecret}
          buttonText="Add this card"
        />
      </Loading>,
      footer: null,
    })
  }

  return [open, contextHolder];
};


