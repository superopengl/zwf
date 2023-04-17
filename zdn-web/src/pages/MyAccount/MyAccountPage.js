import { Card, Button, Modal, Space, Typography, Row, Col } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { WarningOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { subscriptionDef } from 'def/subscriptionDef';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { cancelSubscription, getMyCurrentSubscription } from 'services/subscriptionService';
import { TimeAgo } from 'components/TimeAgo';
import { getMyAccount } from 'services/accountService';
import ReactDOM from 'react-dom';
import { getAuthUser } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import loadable from '@loadable/component'
import { ArrowRightOutlined } from '@ant-design/icons';

const PaymentStepperWidget = loadable(() => import('components/checkout/PaymentStepperWidget'));
const MySubscriptionHistoryDrawer = loadable(() => import('./MySubscriptionHistoryDrawer'));

const { Paragraph, Text, Title } = Typography;


const ContainerStyled = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  // .ant-divider {
  //   margin: 20px 0 8px;
  // }
`;

const span = {
  xs: 24,
  sm: 24,
  md: 8,
  lg: 8,
  xl: 8,
  xxl: 8
};


const StyledRow = styled(Row)`
  // margin-top: 20px;
  // margin-left: auto;
  // margin-right: auto;
`;

const StyledCol = styled(Col)`
  margin-bottom: 20px;
`;

const MyAccountPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [currentSubscription, changeToNewSubscription] = React.useState();
  const [planType, setPlanType] = React.useState();
  const [subscriptionHistoryVisible, setSubscriptionHistoryVisible] = React.useState(false);
  const [account, setAccount] = React.useState({});
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const context = React.useContext(GlobalContext);

  const load = async (refreshAuthUser = false) => {
    try {
      setLoading(true);
      const account = await getMyAccount();
      const subscription = await getMyCurrentSubscription();
      const user = refreshAuthUser ? await getAuthUser() : null;

      ReactDOM.unstable_batchedUpdates(() => {
        setAccount(account);
        changeToNewSubscription(subscription);
        if (refreshAuthUser) {
          context.setUser(user);
        }
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load(false);
  }, []);

  const currentPlanKey = currentSubscription?.type || 'free';
  const isCurrentFree = currentPlanKey === 'free';

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      await cancelSubscription(currentSubscription.id);
      load(true);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelCurrentPlan = () => {
    Modal.confirm({
      title: 'Cancel subscription',
      icon: <WarningOutlined />,
      content: 'Changing back to free plan will terminate your current subscription without refund. Continue?',
      okText: 'Yes, continue',
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      onOk: async () => {
        await handleCancelSubscription();
      },
      cancelText: 'No, keep the current plan',
    });
  }

  const handleChangePlan = (subscription) => {
    if (subscription.key === currentPlanKey) {
      return;
    }
    if (subscription.key === 'free') {
      handleCancelCurrentPlan();
    } else if (currentSubscription) {
      Modal.confirm({
        title: 'Change subscription',
        icon: <WarningOutlined />,
        content: 'Changing subscription will terminate your current subscription without refund. Continue?',
        okText: 'Yes, continue',
        maskClosable: true,
        okButtonProps: {
          danger: true
        },
        onOk: () => {
          setPlanType(subscription.key);
          setModalVisible(true);
        },
        cancelText: 'No, keep the current plan',
      });
    } else {
      setPlanType(subscription.key);
      setModalVisible(true);
    }
  }

  const handlePaymentOk = () => {
    setModalVisible(false);
    load();
  }

  const handleCancelPayment = () => {
    setModalVisible(false);
  }

  const terminateCurrentSubscription = async () => {

    Modal.confirm({
      title: 'Terminate current subscription',
      icon: <WarningOutlined />,
      okText: 'Yes, terminate it',
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      onOk: async () => {
        await handleCancelSubscription();
      },
      cancelText: 'No, keep it',
    });
  }


  return (
    <ContainerStyled>
      <Loading loading={loading} style={{ width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', alignItems: 'stretch', justifyContent: 'center' }}>
          <Card
            bordered={false}
            title="Subscription"
            extra={
              <Space>
                <Button key={0} onClick={() => setSubscriptionHistoryVisible(true)}>Billing</Button>
                {!isCurrentFree && <Button key={1} type="primary" danger onClick={() => terminateCurrentSubscription()}>Terminate Current Plan</Button>}
              </Space>
            }
          >
            <Paragraph type="secondary">One subscription at a time. Please notice the new subscription will take place immidiately and the ongoing subscription will be terminated right away without refunding.</Paragraph>
            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <StyledRow gutter={[30, 30]} style={{ maxWidth: 900 }}>
                {subscriptionDef.map(s => <StyledCol key={s.key} {...span}>
                  <SubscriptionCard
                    title={s.title}
                    icon={s.icon}
                    description={s.description}
                    onClick={() => handleChangePlan(s)}
                    price={s.price}
                    active={s.key === currentPlanKey}
                    unit={s.unit} />
                </StyledCol>)}
              </StyledRow>
            </div>
            <StyledRow style={{ marginTop: 30 }}>
              {currentSubscription && <Col span={24}>
                {/* <Title level={4}>{getSubscriptionName(currentSubscription.type)}</Title> */}
                <Title level={5}>Subscription period</Title>
                <Space>
                  <TimeAgo value={currentSubscription.start} direction="horizontal" showAgo={false} accurate={false} />
                  <ArrowRightOutlined />

                  <TimeAgo value={currentSubscription.end} direction="horizontal" showAgo={false} accurate={false} />
                </Space>
                {currentSubscription.recurring && <>
                  <Title level={5} style={{ marginTop: 20 }}>Next payment</Title>
                  <TimeAgo value={currentSubscription.end} direction="horizontal" showAgo={false} accurate={false} />
                </>}
              </Col>}
            </StyledRow>
          </Card>
        </Space>
      </Loading>
      <Modal
        visible={modalVisible}
        closable={!paymentLoading}
        maskClosable={false}
        title="Subscribe plan"
        destroyOnClose
        footer={null}
        width={520}
        onOk={handleCancelPayment}
        onCancel={handleCancelPayment}
      >
        <PaymentStepperWidget 
          planType={planType}
          onComplete={handlePaymentOk}
          onLoading={loading => setPaymentLoading(loading)}
        />
      </Modal>
      <MySubscriptionHistoryDrawer
        visible={subscriptionHistoryVisible}
        onClose={() => setSubscriptionHistoryVisible(false)}
      />
    </ContainerStyled>
  );
};

MyAccountPage.propTypes = {};

MyAccountPage.defaultProps = {};

export default withRouter(MyAccountPage);
