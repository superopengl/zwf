import React from 'react';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Switch, Divider, Input, Card } from 'antd';
import { getAuthUser } from 'services/authService';
import PropTypes from 'prop-types';
import { Space } from 'antd';
import Icon, { LeftOutlined } from '@ant-design/icons';
import { subscriptionDef } from 'def/subscriptionDef';
import MoneyAmount from '../MoneyAmount';
import { Loading } from '../Loading';
import { calculatePaymentDetail, confirmSubscriptionPayment, provisionSubscription } from 'services/subscriptionService';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';
import ReactDOM from 'react-dom';
import { GlobalContext } from 'contexts/GlobalContext';
import { FaCashRegister } from 'react-icons/fa';
import { BsCardChecklist } from 'react-icons/bs';
import { InputNumber } from 'antd';

const { Title, Text } = Typography;

const PaymentStepperWidget = (props) => {

  const { planType, onComplete, onLoading } = props;
  const [loading, setLoading] = React.useState(false);
  const [seats, setSeats] = React.useState(5);
  const [paymentDetail, setPaymentDetail] = React.useState();
  const [promotionCode, setPromotionCode] = React.useState();
  const [currentStep, setCurrentStep] = React.useState(0);
  const context = React.useContext(GlobalContext);


  const fetchPaymentDetail = async (planType, seats, promotionCode) => {
    try {
      setLoading(true)
      const detail = await calculatePaymentDetail(planType, seats, promotionCode);
      ReactDOM.unstable_batchedUpdates(() => {
        setPaymentDetail(detail);
        setLoading(false)
      });
    } catch {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    onLoading(loading);
  }, [loading]);

  // React.useEffect(() => {
  //   fetchPaymentDetail(willUseCredit);
  // }, []);

  React.useEffect(() => {
    fetchPaymentDetail(planType, seats, promotionCode);
  }, [planType, seats, promotionCode]);

  if (!planType) return null;

  const newPlanDef = subscriptionDef.find(s => s.key === planType);

  const handleProvisionSubscription = async (method) => {
    const provisionData = await provisionSubscription({
      plan: planType,
      promotionCode,
      method
    });
    return provisionData;
  }

  const handleSuccessfulPayment = async (paymentId, payload) => {
    try {
      setLoading(true);
      await confirmSubscriptionPayment(paymentId, payload);
      // Needs to refresh auth user because the role may have changed based on subscription change.
      context.setUser(await getAuthUser());
    } finally {
      setLoading(false);
    }
    onComplete();
  }

  const handlePromotionCodeChange = code => {
    setPromotionCode(code);
    
  }

  const handleStepChange = current => {
    setCurrentStep(current);
  }

  const stepDef = [
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Seats:</Text>
          <Space>
            <Text><MoneyAmount value={paymentDetail?.unitPrice} /> × </Text>
            <InputNumber value={seats} onChange={num => setSeats(num)} min={1} step={1} />
          </Space>
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Total price:</Text>
          {paymentDetail ? <MoneyAmount value={paymentDetail.price} /> : '-'}
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Deduction (from previous unfinished subscription):</Text>
          {paymentDetail ? <MoneyAmount value={paymentDetail.creditBalance * -1} /> : '-'}
        </Space>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>Promotion code</Text>
          <Input value={promotionCode} onChange={e => setPromotionCode(e.target.value)} />
        </Space>
        <Divider />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount:</Text>
          {paymentDetail ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentDetail.payable} /> : '-'}
        </Space>
        <Button type="primary" block
          size="large"
          style={{ marginTop: 20 }} onClick={() => handleStepChange(1)}>
          Checkout
        </Button>
      </Space>
    },
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount:</Text>
          {paymentDetail ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentDetail.payable} /> : '-'}
        </Space>
        {/* <Divider/> */}
        <StripeCardPaymentWidget
          onProvision={() => handleProvisionSubscription('card')}
          onCommit={handleSuccessfulPayment}
          onLoading={setLoading}
        />
      </Space>
    }
  ];

  return (
    <Loading loading={loading} message={'In progress. Please do not close the window.'}>
      <Space direction="vertical" size="large" style={{ width: '100%' }} >
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3}>{newPlanDef.title}</Title>
            <div><Text strong type="success"><big>$ {newPlanDef.price}</big></Text> {newPlanDef.unit}</div>
          </Space>
          <div style={{ display: 'flex' }}>
            {newPlanDef.description}
          </div>
        </Card>
        <div style={{ width: '100%', marginTop: 16, marginBottom: 30 }}>
          {stepDef[currentStep].component}
        </div>
      </Space>
    </Loading>
  )
}

PaymentStepperWidget.propTypes = {
  planType: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
};

PaymentStepperWidget.defaultProps = {
};

export default withRouter(PaymentStepperWidget);
