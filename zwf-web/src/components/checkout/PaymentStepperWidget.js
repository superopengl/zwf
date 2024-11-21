import React from 'react';

import { Typography, Button, Input, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import { Space } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { subscriptionDef } from 'def/subscriptionDef';
import MoneyAmount from '../MoneyAmount';
import { Loading } from '../Loading';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';
import { saveOrgPaymentMethod } from 'services/orgPaymentMethodService';
import { Descriptions } from 'antd';
import styled from 'styled-components';

const { Title, Text, Paragraph } = Typography;

const Container = styled.div`
.ant-descriptions-item-content {
  justify-content: flex-end;
}
`;

const PaymentStepperWidget = (props) => {

  const { onComplete, onLoading } = props;
  const [loading, setLoading] = React.useState(false);
  const [seats, setSeats] = React.useState();
  const [promotionCode, setPromotionCode] = React.useState();
  const [paymentInfo, setPaymentInfo] = React.useState();
  const [currentStep, setCurrentStep] = React.useState(0);


  React.useEffect(() => {
    onLoading(loading);
  }, [loading]);


  const handleGoToPromotionCode = () => {
    setCurrentStep(1);
  }

  const handleGoToChangeReview = () => {
    setCurrentStep(2);
  }

  const stepDef = [
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Title level={2}>License count</Title>
        <Paragraph>Your current subscription has <strong>{paymentInfo?.seatsBefore}</strong> licenses ({paymentInfo?.minSeats} being used).</Paragraph>
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button type="primary" size="large" icon={<MinusOutlined />}
            // style={{ width: 60 }}
            shape="circle"
            ghost
            onClick={() => setSeats(seats - 1)} disabled={seats <= paymentInfo?.minSeats} />
          {paymentInfo && <Input placeholder="New licenses"
            size="large"
            value={seats}
            onChange={e => setSeats(+e.target.value)}
            style={{ textAlign: 'center', width: 80 }}
          />}
          <Button type="primary" size="large" icon={<PlusOutlined />}
            // style={{ width: 60 }}
            shape="circle"
            onClick={() => setSeats(seats + 1)} />

        </Space>
        <Button type="primary" block
          size="large"
            style={{ marginTop: 20 }} onClick={handleGoToPromotionCode}>
          Next
        </Button>
      </Space>
    },
    {
      component: <Space direction="vertical" style={{ width: '100%', justifyContent: 'center' }} size="middle">
        <Title level={2}>Promotion Code</Title>
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Tooltip
            visible={promotionCode && !paymentInfo?.isValidPromotionCode}
            placement="top"
            color="#ffffff"
            title={<Text type="danger">Invalid promotion code</Text>}
          >
            <Input value={promotionCode} placeholder="Promotion code"
              size="large"
              onChange={e => setPromotionCode(e.target.value)} style={{ textAlign: 'center' }} />
          </Tooltip>
        </Space>
        <Button type="primary" block
          size="large"
          style={{ marginTop: 20 }} onClick={handleGoToChangeReview}>
          Next
        </Button>
      </Space>
    },
    {
      component: !paymentInfo ? null : <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Descriptions column={1}>
          <Descriptions.Item label="Unit price" contentStyle={{ textAlign: 'right' }}>
            <MoneyAmount value={paymentInfo.seatPrice} />
          </Descriptions.Item>
          <Descriptions.Item label="License count" contentStyle={{ textAlign: 'right' }}>
            &times; {paymentInfo.seatsAfter}
          </Descriptions.Item>
          <Descriptions.Item label="Full price" contentStyle={{ textAlign: 'right' }}>
            <MoneyAmount value={paymentInfo.fullPriceBeforeDiscount} />
          </Descriptions.Item>
          <Descriptions.Item label={<>Total price with promotion price {paymentInfo.promotionUnitPrice}</>} contentStyle={{ textAlign: 'right' }}>
            <MoneyAmount strong value={paymentInfo.fullPriceAfterDiscount} />
          </Descriptions.Item>
        </Descriptions>
        <hr />
        <Descriptions column={1}>
          <Descriptions.Item label="Credit balance" contentStyle={{ textAlign: 'right' }}>
            <MoneyAmount value={paymentInfo.creditBalanceBefore} />
          </Descriptions.Item>
          <Descriptions.Item label="Refundable" contentStyle={{ textAlign: 'right' }}>
            <MoneyAmount value={paymentInfo.refundable} />
          </Descriptions.Item>
          <Descriptions.Item label="Total deduction" contentStyle={{ textAlign: 'right' }}>
            <MoneyAmount strong value={paymentInfo.deduction} />
          </Descriptions.Item>
        </Descriptions>
        <hr />
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount:</Text>
          {paymentInfo ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentInfo.payable} /> : '-'}
        </Space>
        {/* <Button type="primary" block
          size="large"
          style={{ marginTop: 20 }} onClick={handleCheckout}>
          Checkout
        </Button> */}
      </Space>
    },
    {
      component: <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text strong>Total payable amount:</Text>
          {paymentInfo ? <MoneyAmount style={{ fontSize: '1.2rem' }} strong value={paymentInfo.payable} /> : '-'}
        </Space>
        <Paragraph type="secondary">
          This card will be added to the payment methods for future auto renew payment automatically.
        </Paragraph>
        {/* <StripeCardPaymentWidget
          onOk={handlePayByNewCard}
          onLoading={loading => setLoading(loading)}
        /> */}
      </Space>
    }
  ];

  const newPlanDef = subscriptionDef[1];

  return (
    <Container>
      <Loading loading={loading} message={'In progress. Please do not close the window.'}>
        <Space direction="vertical" size="large" style={{ width: '100%' }} >
          {/* <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Title level={3}>{newPlanDef.title}</Title>
            <div><Text strong type="success"><big>$ {newPlanDef.price}</big></Text> {newPlanDef.unit}</div>
          </Space>
          <div style={{ display: 'flex' }}>
            {newPlanDef.description}
          </div>
        </Card> */}
          <div style={{ width: '100%', marginTop: 16, marginBottom: 30 }}>
            {stepDef[currentStep].component}
          </div>
        </Space>
      </Loading>
    </Container>
  )
}

PaymentStepperWidget.propTypes = {
  onComplete: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
};

PaymentStepperWidget.defaultProps = {
};

export default PaymentStepperWidget;
