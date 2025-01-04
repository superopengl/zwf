import React from 'react';
import { OrgSubscriptionHistoryPanel } from './OrgSubscriptionHistoryPanel';
import { PageContainer } from '@ant-design/pro-components';
import {OrgPaymentMethodPanel} from './OrgPaymentMethodPanel';

const OrgSubscriptionPage = () => {

  return (
    <PageContainer
      fixedHeader
      header={{
        title: 'Subscription',
      }}
      tabList={[
        {
          tab: 'Invoices',
          key: 'invoices',
          children: <OrgSubscriptionHistoryPanel />
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
