import { Typography, Row, Col } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import loadable from '@loadable/component'
import { OrgSubscriptionHistoryPanel } from './OrgSubscriptionHistoryPanel';
import { listMySubscriptions$ } from 'services/subscriptionService';
import { finalize } from 'rxjs/operators';
import { PageContainer } from '@ant-design/pro-components';
import {OrgPaymentMethodPanel} from './OrgPaymentMethodPanel';


const { Paragraph, Text, Title, Link: TextLink } = Typography;


const OrgSubscriptionPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [billingHistory, setBillingHistory] = React.useState([]);

  React.useEffect(() => {
    const sub$ = listMySubscriptions$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(data => setBillingHistory(data));

    return () => {
      sub$.unsubscribe();
    }
  }, []);


  return (
    <PageContainer
      loading={loading}
      fixedHeader
      header={{
        title: 'Subscription',
      }}
      tabList={[
        {
          tab: 'Invoices',
          key: 'invoices',
          children: <OrgSubscriptionHistoryPanel data={billingHistory} />
        },
        {
          tab: 'Payment Methods',
          key: 'payment_methods',
          children: <OrgPaymentMethodPanel />
        }
      ]}
      tabProps={{
        hideAdd: true
      }}
    >
      
    </PageContainer>
  );
};

OrgSubscriptionPage.propTypes = {};

OrgSubscriptionPage.defaultProps = {};

export default OrgSubscriptionPage;
