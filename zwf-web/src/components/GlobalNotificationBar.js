import React from 'react';
import { message, Typography, Button, Space } from 'antd';
import { listOrgPaymentMethods$ } from 'services/orgPaymentMethodService';
import { useAddPaymentMethodModal } from '../hooks/useAddPaymentMethodModal';
import { delay, tap, of, filter, switchMap, forkJoin } from 'rxjs';
import { useAuthUser } from 'hooks/useAuthUser';
import moment from 'moment';
import { notify } from 'util/notify';
import { notification } from 'antd';
import { useRole } from 'hooks/useRole';

const { Link, Paragraph, Text } = Typography;

const PAYMENT_METHOD_NOT_SPECIFIED_KEY = 'Payment method not specified';
export const GlobalNotificationBar = () => {
  const [openAddPaymentModal, modalContextHolder] = useAddPaymentMethodModal();
  const [user] = useAuthUser();
  const role = useRole();
  const { suspended, currentPlanType, currentPeriodTo } = user;
  const periodTo = moment(currentPeriodTo);

  const shouldPrompt = (beforeDays = 3) => {
    return currentPlanType !== 'trial' || moment(periodTo).add(-beforeDays, 'days').isBefore();
  }

  const source$ = of(null).pipe(
    filter(() => role === 'admin'),
    filter(() => shouldPrompt()),
    delay(5000),
  )

  React.useEffect(() => {
    const trialPeriodCheck$ = source$.pipe(
      filter(() => currentPlanType === 'trial'),
      tap(() => {
        notify.info(
          'Trial period is ending',
          <>
            <Paragraph>
              The trial plan is ending on <Text underline>{periodTo.format('MMM D YYYY')}</Text>. And after then system will automatically transition to a monthly plan. The payment for the first monthly plan period will be processed on or after <Text underline>{periodTo.add(30, 'days').add(-1, 'day').format('MMM D YYYY')}</Text>.
            </Paragraph>
          </>,
          0,
        );
      })
    );

    const paymentMethodCheck$ = source$.pipe(
      switchMap(() => listOrgPaymentMethods$()),
      filter(list => !list?.length),
      tap(() => {
        notify.info(
          PAYMENT_METHOD_NOT_SPECIFIED_KEY,
          <>
            <Paragraph>
              To ensure the success of your business, please <Link strong onClick={handleAddPaymentMethod}>add a payment method</Link> as soon as possible, as none has been specified.
            </Paragraph>
          </>,
          0,
        );
      })
    );

    const sub$ = forkJoin([trialPeriodCheck$, paymentMethodCheck$]).subscribe();

    return () => sub$.unsubscribe();
  }, [user]);

  const handleAddPaymentMethod = () => {
    openAddPaymentModal(() => {
      notification.destroy(PAYMENT_METHOD_NOT_SPECIFIED_KEY)
    })
  }

  return <>
    {modalContextHolder}
  </>;
};


