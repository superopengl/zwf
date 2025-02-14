import React from 'react';
import styled from 'styled-components';
import { Typography, Descriptions, Layout, Space, Card, Alert } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

import { Logo } from 'components/Logo';
import HomeFooter from 'components/HomeFooter';
import { Loading } from 'components/Loading';
import { getOrgResurgingInfo$, resurgeOrg$ } from 'services/billingService';
import { finalize } from 'rxjs';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import moment from 'moment';
import MoneyAmount from 'components/MoneyAmount';
import { Divider } from 'antd';

const ContainerStyled = styled.div`
padding: 2rem 1rem 4rem;
margin: 1rem auto;
text-align: left;
width: 100%;
max-width: 500px;

h2 {
  font-size: 1.3rem;
}

h3 {
  font-size: 1.1rem;
}

.ant-descriptions-row {
  border-bottom: 1px solid red !important;
}

.ant-descriptions-item-label {
  color: #1C222B;
  font-weight: 600;
}

.ant-descriptions-item-content {
  justify-content: end;
  .ant-typography {
  }
}
`;
const { Title } = Typography;
const OrgResurgingPage = () => {
  const params = useParams();
  const { code } = params;
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState();

  React.useEffect(() => {
    getOrgResurgingInfo$(code).pipe(
      finalize(() => setLoading(false))
    ).subscribe(setData);
  }, []);

  const handleCheckout = (stripePaymentMethodId) => {
    resurgeOrg$(code, { stripePaymentMethodId })
      .subscribe(() => {
      });
  }

  const period = data?.period || {};
  const billingInfo = data?.billingInfo || {};

  return <Layout>
    <ContainerStyled>
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}><Logo /></div>
      <Title style={{ textAlign: 'center', marginBottom: 40 }}>Resume subscription</Title>
      <Alert 
      style={{ marginBottom: 40 }}
      type="info"
      // showIcon
      message="Your organization has an unpaid bill that needs to be settled. Kindly make payment for the amount due to resume using our system. Thank you for your cooperation."
      />
      <Loading loading={loading}>
        <Descriptions size="large" column={1}>
          <Descriptions.Item label="Organization">
            {data?.orgName}
          </Descriptions.Item>
          <Descriptions.Item label="Billing Period">
            {moment(period.periodFrom).format('MMM DD YYYY')} - {moment(period.periodTo).format('MMM DD YYYY')} ({period.periodDays} days)
          </Descriptions.Item>
          <Descriptions.Item label="Period days">
            {period.periodDays} days
          </Descriptions.Item>
          <Descriptions.Item label="Billing Unit">
            {billingInfo.payableDays}
          </Descriptions.Item>
          <Descriptions.Item label="Unit price">
            <MoneyAmount value={period.unitFullPrice} delete={period.promotionCode} postfix="/ mo" />
          </Descriptions.Item>
          {period.promotionCode && <Descriptions.Item label="Unit price (after discount)">
            <MoneyAmount value={period.promotionUnitPrice} postfix="/ mo" />
          </Descriptions.Item>}
          <Descriptions.Item label="Due amount (GST included)">
            <MoneyAmount value={billingInfo.payable} style={{ fontSize: 30 }} strong />
          </Descriptions.Item>
        </Descriptions>
        <Divider />
        <StripeCardPaymentWidget
          onOk={handleCheckout}
          onLoading={loading => setLoading(loading)}
          onClientSecret={() => data?.clientSecret}
          buttonText="Checkout"
        />
        {/* <DebugJsonPanel value={data} /> */}
      </Loading>
    </ContainerStyled>
    <HomeFooter />
  </Layout>
}

OrgResurgingPage.propTypes = {};

OrgResurgingPage.defaultProps = {};

export default OrgResurgingPage;
