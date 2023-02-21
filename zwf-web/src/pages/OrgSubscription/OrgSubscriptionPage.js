import React from 'react';
import { OrgSubscriptionHistoryPanel } from './OrgSubscriptionHistoryPanel';
import { PageContainer } from '@ant-design/pro-components';
import {OrgPaymentMethodPanel} from './OrgPaymentMethodPanel';
import { PageHeaderContainer } from 'components/PageHeaderContainer';

const OrgSubscriptionPage = () => {

  return (
    <PageHeaderContainer
    breadcrumb={[
      {
        name: 'Others'
      },
      {
        name: 'Subscription',
      },
    ]}
      fixedHeader
      title='Subscription & Billings'
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
      
    </PageHeaderContainer>
  );
};

OrgSubscriptionPage.propTypes = {};

OrgSubscriptionPage.defaultProps = {};

export default OrgSubscriptionPage;
