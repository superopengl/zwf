import { Card, Button, Modal, Space, Typography, Row, Col, Alert } from 'antd';
import React from 'react';

import styled from 'styled-components';
import { Loading } from 'components/Loading';
import MoneyAmount from 'components/MoneyAmount';
import { getAuthUser } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import loadable from '@loadable/component'
import { FormattedMessage } from 'react-intl';
import * as moment from 'moment-timezone';
import { OrgSubscriptionHistoryPanel } from './OrgSubscriptionHistoryPanel';
import { from } from 'rxjs';
import OrgPaymentMethodPanel from './OrgPaymentMethodPanel';
import { listMySubscriptions$, searchMyTicketUsage$ } from 'services/subscriptionService';
import { finalize } from 'rxjs/operators';

const PaymentStepperWidget = loadable(() => import('components/checkout/PaymentStepperWidget'));

const { Paragraph, Text, Title, Link: TextLink } = Typography;


const ContainerStyled = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-contents: center;


  .ant-spin-nested-loading {
    width: 100%;
  }

  // .ant-divider {
  //   margin: 20px 0 8px;
  // }
`;


const StyledRow = styled(Row)`
  // margin-top: 20px;
  // margin-left: auto;
  // margin-right: auto;
`;

const StyledCol = styled(Col)`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const OrgAccountPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [billingHistory, setBillingHistory] = React.useState([]);

  React.useEffect(() => {
    const sub$ = listMySubscriptions$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(data => setBillingHistory(data));

    // const x$ = searchMyTicketUsage$(moment().toDate(), moment().add(17, 'day').toDate()).subscribe(d => {
    //   debugger;
    //   const ok = d;
    // });

    return () => {
      sub$.unsubscribe();
    }
  }, []);


  return (
    <ContainerStyled>
      <Loading loading={loading} style={{ width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', justifyContent: 'center' }}>
          <Card
            bordered={false}
            title="Billings"
            style={{ width: '100%' }}
          // extra={
          //   <Button key={0} onClick={() => setSubscriptionHistoryVisible(true)}>Subscription History & Billings</Button>
          // }
          >
            {/* <Space direction="vertical" style={{ width: '100%' }} size="large">
              {currentSubscription && !currentSubscription?.lastRecurring && <Alert type="info" showIcon description={<>
                Your subscription will expire on <Text underline strong>{moment.tz(currentSubscription.end, 'utc').format('D MMM YYYY')}</Text>.
                You can extend the subscription by continue purchasing a new plan, where you can opt in auto renew payment.
                The new plan will take effect right after all your alive subscription ends.
              </>} />}
              {!currentSubscription && <Alert type="info" showIcon description={
                <FormattedMessage id="text.freeToPaidSuggestion" />
              } />}
              <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Button size="large" onClick={handleBuyLicense} type="primary" style={{ transform: 'scale(1.3)' }}>Change subscription</Button>
              </Space>
              <Paragraph type="secondary">
                You can buy more or reduce licenses by purchasing a new subscription. The ongoing subscription will be terminated and the remaining licenses will be returned as credits, which will be applied to your new subscription's payment automatically. The new subscription will start right away.
              </Paragraph>
            </Space> */}
            <OrgSubscriptionHistoryPanel data={billingHistory} />
          </Card>
          <OrgPaymentMethodPanel />
        </Space>
      </Loading>
    </ContainerStyled>
  );
};

OrgAccountPage.propTypes = {};

OrgAccountPage.defaultProps = {};

export default OrgAccountPage;
