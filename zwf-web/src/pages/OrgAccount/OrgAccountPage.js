import { Card, Button, Modal, Space, Typography, Row, Col, Alert } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { subscriptionDef } from 'def/subscriptionDef';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { getMyCurrentSubscription, listMySubscriptionHistory } from 'services/subscriptionService';
import MoneyAmount from 'components/MoneyAmount';
import { getMyAccount, listMyCreditHistory } from 'services/accountService';
import ReactDOM from 'react-dom';
import { getAuthUser } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import loadable from '@loadable/component'
import { FormattedMessage } from 'react-intl';
import * as moment from 'moment-timezone';
import OrgSubscriptionHistoryPanel from './OrgSubscriptionHistoryPanel';
import { from } from 'rxjs';
import OrgPaymentMethodPanel from './OrgPaymentMethodPanel';

const PaymentStepperWidget = loadable(() => import('components/checkout/PaymentStepperWidget'));
const CreditHistoryListModal = loadable(() => import('./CreditHistoryListDrawer'));

const { Paragraph, Text, Title, Link: TextLink } = Typography;


const ContainerStyled = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

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
  const [modalVisible, setModalVisible] = React.useState(false);
  const [currentSubscription, setCurrentSubscription] = React.useState();
  const [planType, setPlanType] = React.useState();
  const [creditHistoryVisible, setCreditHistoryVisible] = React.useState(false);
  const [account, setAccount] = React.useState({});
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = React.useState([]);
  const context = React.useContext(GlobalContext);

  const load = async (refreshAuthUser = false) => {
    try {
      setLoading(true);
      const account = await getMyAccount();
      const subscription = await getMyCurrentSubscription();
      const user = refreshAuthUser ? await getAuthUser() : null;
      const subscriptionHistory = await listMySubscriptionHistory();

      ReactDOM.unstable_batchedUpdates(() => {
        setAccount(account);
        setCurrentSubscription(subscription);
        if (refreshAuthUser) {
          context.setUser(user);
        }
        setSubscriptionHistory(subscriptionHistory);
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    const load$ = from(load(false)).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleFetchMyCreditHistoryList = async () => {
    const data = await listMyCreditHistory();
    return (data || []).filter(x => x.amount);
  }

  const currentPlanKey = currentSubscription?.currentType || 'trial';
  const isCurrentFree = currentPlanKey === 'trial';


  const handleBuyLicense = () => {
    setModalVisible(true);
  }

  const handlePaymentOk = async () => {
    setModalVisible(false);
    await load();
  }

  const handleCancelPayment = () => {
    setModalVisible(false);
  }

  const priceCardSpan = isCurrentFree ? {
    xs: 24,
    sm: 24,
    md: 24,
    lg: 12,
    xl: 12,
    xxl: 12
  } : {
    xs: 24,
    sm: 24,
    md: 12,
    lg: 12,
    xl: 12,
    xxl: 12
  };

  return (
    <ContainerStyled>
      <Loading loading={loading} style={{ width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', justifyContent: 'center' }}>
          <Card
            bordered={false}
            title="Subscription"
            style={{ width: '100%' }}
          // extra={
          //   <Button key={0} onClick={() => setSubscriptionHistoryVisible(true)}>Subscription History & Billings</Button>
          // }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {currentSubscription && !currentSubscription?.lastRecurring && <Alert type="info" showIcon description={<>
                Your subscription will expire on <Text underline strong>{moment.tz(currentSubscription.end, 'utc').format('D MMM YYYY')}</Text>.
                  You can extend the subscription by continue purchasing a new plan, where you can opt in auto renew payment.
                  The new plan will take effect right after all your alive subscription ends.
              </>} />}
              {!currentSubscription && <Alert type="info" showIcon description={
                <FormattedMessage id="text.freeToPaidSuggestion" />
              } />}
              <Space direction="vertical" align="center">
                {/* <Title><TextLink underline onClick={handleBuyLicense}>Change subscription</TextLink></Title> */}
                <Button size="large" onClick={handleBuyLicense} type="primary" style={{transform: 'scale(1.3)', marginBottom: 16}}>Change subscription</Button>
                <Paragraph type="secondary">
                  You can buy more or reduce licenses by purchasing a new subscription. The ongoing subscription will be terminated and the remaining licenses will be returned as credits, which will be applied to your new subscription's payment automatically. The new subscription will start right away.
                </Paragraph>
              </Space>
            </Space>
            <OrgSubscriptionHistoryPanel data={subscriptionHistory} />
          </Card>
          <Card
            bordered={false}
            title="Credits"
            extra={
              <Title><MoneyAmount type="success" value={account.credit} /></Title>
            }
          >
            <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: "flex-start" }}>
              <Paragraph type="secondary">
                Credits are by refund from previous unfinished subsccription when you choose to change subscription.
              </Paragraph>

              <Button key={0} onClick={() => setCreditHistoryVisible(true)}>
                Credit History
              </Button>
            </Space>
          </Card>
          <OrgPaymentMethodPanel />
        </Space>
      </Loading>
      <Modal
        visible={modalVisible}
        closable={!paymentLoading}
        maskClosable={false}
        title="Buy licenses"
        destroyOnClose
        footer={null}
        width={420}
        onOk={handleCancelPayment}
        onCancel={handleCancelPayment}
      >
        <PaymentStepperWidget
          onComplete={handlePaymentOk}
          onLoading={loading => setPaymentLoading(loading)}
        />
      </Modal>
      <CreditHistoryListModal
        visible={creditHistoryVisible}
        onOk={() => setCreditHistoryVisible(false)}
        onFetch={handleFetchMyCreditHistoryList}
      />
    </ContainerStyled>
  );
};

OrgAccountPage.propTypes = {};

OrgAccountPage.defaultProps = {};

export default withRouter(OrgAccountPage);
