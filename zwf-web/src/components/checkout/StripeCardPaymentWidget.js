import React from 'react';
import { Row, Col, Button } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { CreditCardOutlined } from '@ant-design/icons';
import { stripePromise } from 'services/stripeService';
import { getPaymentMethodSecret } from 'services/orgPaymentMethodService';
import styled from 'styled-components';

const StripeElementWrapper = styled.div`
border: 1px solid #d9d9d9;
border-radius: 4px;
padding-top: 8px;
padding-bottom: 8px;
`;

const StripeCardPaymentForm = (props) => {

  const { onOk, onLoading, buttonText } = props;
  const [loading, setLoading] = React.useState(false);
  const [cardNumberComplete, setCardNumberComplete] = React.useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = React.useState(false);
  const [cardCvcComplete, setCardCvcComplete] = React.useState(false);
  const stripe = useStripe();
  const elements = useElements();

  React.useEffect(() => {
    onLoading(loading);
  }, [loading]);

  const isInfoComplete = stripe && elements && cardNumberComplete && cardExpiryComplete && cardCvcComplete;

  const getClientSecret = async () => {
    const result = await getPaymentMethodSecret();
    return result.clientSecret;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isInfoComplete) {
      return;
    }

    try {
      setLoading(true);
      const cardNumberElement = elements.getElement('cardNumber');

      const clientSecret = await getClientSecret();

      // Use your card Element with other Stripe.js APIs
      const rawResponse = await stripe.confirmCardSetup(clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
          }
        });

      const { error } = rawResponse;

      if (error) {
        notify.error('Failed to complete the payment', error.message);
      } else {
        const stripePaymentMethodId = rawResponse.setupIntent.payment_method;
        await onOk(stripePaymentMethodId);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (element) => {
    setCardNumberComplete(element.complete)
  }

  const handleCardExpiryChange = (element) => {
    setCardExpiryComplete(element.complete)
  }

  const handleCardCvcChange = (element) => {
    setCardCvcComplete(element.complete)
  }

  const options = {
    style: {
      base: {
        fontSize: '16px',
        // color: '#3e9448',
        textAlign: 'center',
        '::placeholder': {
          color: 'rgba(0,0,0,0.2)',
        },
        border: '1px solid #0FBFC4',

      },
      invalid: {
        color: '#d7183f',
      },
    },
  };
  return (
    <form onSubmit={handleSubmit}>
      {/* <Text>Please input card information</Text> */}
      {/* <label>Card Number <CardNumberElement /></label> */}
      <Row gutter={[10, 10]} style={{ marginBottom: 24 }}>
        <Col {...{ xs: 24, sm: 16, md: 14, lg: 14, xl: 14, xxl: 14 }}>
          <StripeElementWrapper>
            <CardNumberElement
              onChange={handleCardNumberChange}
              options={{
                ...options,
                placeholder: '1234 1234 1234 1234',
              }}
            />
          </StripeElementWrapper>
        </Col>
        <Col {...{ xs: 12, sm: 4, md: 6, lg: 6, xl: 6, xxl: 6 }}>
          <StripeElementWrapper>
            <CardExpiryElement
              onChange={handleCardExpiryChange}
              options={{
                ...options,
                placeholder: 'MM / YY'
              }}
            />
          </StripeElementWrapper>
        </Col>
        <Col {...{ xs: 12, sm: 4, md: 4, lg: 4, xl: 4, xxl: 4 }}>
          <StripeElementWrapper>
            <CardCvcElement
              onChange={handleCardCvcChange}
              options={{
                ...options,
                placeholder: 'CVC'
              }}
            />
          </StripeElementWrapper>
        </Col>
        <Col span={24}>
          <Button type="primary" size="large" htmlType="submit"
            icon={<CreditCardOutlined />}
            block
            disabled={loading || !isInfoComplete} loading={loading}>
            {buttonText}
          </Button>
        </Col>
      </Row>
    </form>
  )
}

const StripeCardPaymentWidget = props => (<Elements stripe={stripePromise}>
  <StripeCardPaymentForm onOk={props.onOk} onLoading={props.onLoading} buttonText={props.buttonText} />
</Elements>)


StripeCardPaymentWidget.propTypes = {
  onOk: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};

StripeCardPaymentWidget.defaultProps = {
  buttonText: 'Checkout'
};

export default StripeCardPaymentWidget;
