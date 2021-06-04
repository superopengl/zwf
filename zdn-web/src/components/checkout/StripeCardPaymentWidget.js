import React from 'react';
import { Row, Col, Button } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { CreditCardOutlined } from '@ant-design/icons';
import { stripePromise } from 'services/stripeService';

const StripeCardPaymentForm = (props) => {

  const { onProvision, onCommit, onLoading } = props;
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isInfoComplete) {
      return;
    }

    try {
      setLoading(true);
      const cardNumberElement = elements.getElement('cardNumber');

      const paymentInfo = await onProvision();
      const { clientSecret, paymentId } = paymentInfo;

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
        await onCommit(paymentId, {
          stripePaymentMethodId: rawResponse.setupIntent.payment_method
        });
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
        color: '#3e9448',
        textAlign: 'center',
        '::placeholder': {
          color: 'rgba(0,0,0,0.2)',
        },
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
      <Row gutter={[10, 10]} style={{marginBottom: 10}}>
        <Col {...{ xs: 24, sm: 16, md: 15, lg: 15, xl: 15, xxl: 15 }}>
          <CardNumberElement
            onChange={handleCardNumberChange}
            options={{
              ...options,
              placeholder: '1234 1234 1234 1234'
            }}
          />
        </Col>
        <Col {...{ xs: 12, sm: 4, md: 5, lg: 5, xl: 5, xxl: 5 }}>
          <CardExpiryElement
            onChange={handleCardExpiryChange}
            options={{
              ...options,
              placeholder: 'MM / YY'
            }}
          />
        </Col>
        <Col {...{ xs: 12, sm: 4, md: 4, lg: 4, xl: 4, xxl: 4 }}>
          <CardCvcElement
            onChange={handleCardCvcChange}
            options={{
              ...options,
              placeholder: 'CVC'
            }}
          />
        </Col>
      </Row>
      <Button type="primary" size="large" htmlType="submit"
        icon={<CreditCardOutlined />}
        block 
        disabled={loading || !isInfoComplete} loading={loading}>
        Checkout
        </Button>
    </form>
  )
}

const StripeCardPaymentWidget = props => (<Elements stripe={stripePromise}>
  <StripeCardPaymentForm onProvision={props.onProvision} onCommit={props.onCommit} onLoading={props.onLoading}/>
</Elements>)


StripeCardPaymentWidget.propTypes = {
  onProvision: PropTypes.func.isRequired,
  onCommit: PropTypes.func.isRequired,
  onLoading: PropTypes.func.isRequired,
};

StripeCardPaymentWidget.defaultProps = {
};

export default StripeCardPaymentWidget;
