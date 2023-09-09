import React from 'react';
import { Typography } from 'antd';
import { tap, filter, timer } from 'rxjs';
import { useAuthUser } from 'hooks/useAuthUser';
import moment from 'moment';
import { notify } from 'util/notify';
import { useRole } from 'hooks/useRole';

const { Link, Paragraph, Text } = Typography;

export const SubscriptionNotification = () => {
  const [user] = useAuthUser();
  const role = useRole();
  const { currentPlanType, currentPeriodTo } = user;
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
          10,
        );
      })
    ).subscribe();

    return () => sub$.unsubscribe();
  }, [user]);

  return null;
};


