import React from 'react';
import { listOrgPaymentMethods$ } from 'services/orgPaymentMethodService';
import { useAddPaymentMethodModal } from '../hooks/useAddPaymentMethodModal';
import { tap, filter } from 'rxjs';
import { useAuthUser } from 'hooks/useAuthUser';

export const PaymentMethodNotification = () => {
  const [openAddPaymentModal, modalContextHolder] = useAddPaymentMethodModal();
  const [user] = useAuthUser();

  React.useEffect(() => {
    const sub$ = listOrgPaymentMethods$()
      .pipe(
        filter(list => !list?.length),
        tap(() => {
          openAddPaymentModal(null, {closable: false})
        })
      ).subscribe();

    return () => sub$.unsubscribe();
  }, [user]);

  return <>
    {modalContextHolder}
  </>;
};


