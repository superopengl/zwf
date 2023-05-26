import React from 'react';
import { message, Typography, Button, Space } from 'antd';
import { listOrgPaymentMethods$ } from 'services/orgPaymentMethodService';
import { useAddPaymentMethodModal } from '../hooks/useAddPaymentMethodModal';
import { delay, tap, of, filter, switchMap, forkJoin, timer } from 'rxjs';
import { useAuthUser } from 'hooks/useAuthUser';
import moment from 'moment';
import { notify } from 'util/notify';
import { notification } from 'antd';
import { useRole } from 'hooks/useRole';

const { Link, Paragraph, Text } = Typography;

const PAYMENT_METHOD_NOT_SPECIFIED_KEY = 'Payment method not specified';
export const SubscriptionNotification = () => {
  const [openAddPaymentModal, modalContextHolder] = useAddPaymentMethodModal();
  const [user] = useAuthUser();
  const role = useRole();
  const { suspended, currentPlanType, currentPeriodTo } = user;
  const periodTo = moment(currentPeriodTo);

  const shouldPrompt = (beforeDays = 3) => {
    return currentPlanType !== 'trial' || moment(periodTo).add(-beforeDays, 'days').isBefore();
  }

  const source$ = timer(5000, 1000 * 3600 * 4).pipe(
    filter(() => role === 'admin'),
    filter(() => shouldPrompt()),
  )

  React.useEffect(() => {
    const sub$ = source$.pipe(
      filter(() => currentPlanType === 'trial'),
      tap(() => {
        notify.info(
          'Trial period is ending',
          <>
            <Paragraph>
              The trial plan is ending on <Text underline>{periodTo.format('D MMM YYYY')}</Text>. And after then system will automatically transition to a monthly plan. The payment for the first monthly plan period will be processed on or after <Text underline>{periodTo.add(30, 'days').add(-1, 'day').format('D MMM YYYY')}</Text>.
            </Paragraph>
          </>,
          0,
        );
      })
    ).subscribe();

    return () => sub$.unsubscribe();
  }, [user]);

  React.useEffect(() => {
    const sub$ = source$.pipe(
      switchMap(() => listOrgPaymentMethods$()),
      filter(list => !list?.length),
      tap(() => {
        notify.warning(
          PAYMENT_METHOD_NOT_SPECIFIED_KEY,
          <>
            <Paragraph>
              To ensure the success of your business, please <Link strong onClick={handleAddPaymentMethod}>add a payment method</Link> as soon as possible, as none has been specified.
            </Paragraph>
            <Paragraph>
              If you haven't set up a valid payment method, your organization account may face suspension starting from <Text underline>{periodTo.add(30, 'days').add(-1, 'day').format('D MMM YYYY')}</Text>.
            </Paragraph>
          </>,
          0,
        );
      })
    ).subscribe();

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


