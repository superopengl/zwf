import React from 'react';
import { OrgSubscriptionHistoryPanel } from './OrgSubscriptionHistoryPanel';
import { PageContainer } from '@ant-design/pro-components';
import { OrgPaymentMethodPanel } from './OrgPaymentMethodPanel';
import { OrgLicenseUsagePanel } from './OrgLicenseUsagePanel';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';

const OrgSubscriptionPage = () => {
  useAssertRole(['admin']);
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
      maxWidth={1200}
      fixedHeader
      title='Subscription & Billings'
      tabList={[
        {
          tab: 'Billing',
          key: 'billing',
          children: <OrgLicenseUsagePanel />
        },
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
