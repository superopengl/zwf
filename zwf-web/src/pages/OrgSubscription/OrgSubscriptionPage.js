import React from 'react';
import { OrgSubscriptionHistoryPanel } from './OrgSubscriptionHistoryPanel';
import { PageContainer } from '@ant-design/pro-components';
import { OrgPaymentMethodPanel } from './OrgPaymentMethodPanel';
import { OrgLicenseUsagePanel } from './OrgLicenseUsagePanel';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';
import { Tabs } from 'antd';

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
      title='Subscription & Billings'
      style={{
        maxWidth: 1200,
      }}
    >
      <Tabs
        defaultActiveKey='subscription'
        type="card"
        items={[
          {
            label: 'Subscription',
            key: 'subscription',
            children: <OrgLicenseUsagePanel />
          },
          {
            label: 'Invoices',
            key: 'invoices',
            children: <OrgSubscriptionHistoryPanel />
          },
          {
            label: 'Payment Methods',
            key: 'payment_methods',
            children: <OrgPaymentMethodPanel />
          }
        ]}
      />
    </PageHeaderContainer>
  );
};

OrgSubscriptionPage.propTypes = {};

OrgSubscriptionPage.defaultProps = {};

export default OrgSubscriptionPage;
