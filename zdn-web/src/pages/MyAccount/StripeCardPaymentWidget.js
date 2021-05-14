import React from 'react';
import { Space, Button } from 'antd';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { stripePromise } from 'services/stripeService';
import { getPaymentMethodSecret$, saveOrgPaymentMethod$ } from 'services/orgPaymentMethodService';

const StripeCardPaymentForm = (props) => {

  const { onLoading, onComplete } = props;
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
    const result = await getPaymentMethodSecret$().toPromise();
    return result.clientSecret;
  }

  const savePaymentMethod = async (paymentMethodId) => {
    await saveOrgPaymentMethod$(paymentMethodId).toPromise();
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
        await savePaymentMethod(rawResponse.setupIntent.payment_method);
        onComplete();
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
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <div style={{ width: 200 }}>
          <CardNumberElement
            onChange={handleCardNumberChange}
            options={options}
          />
        </div>
        <div style={{ width: 90 }}>
          <CardExpiryElement
            onChange={handleCardExpiryChange}
            options={options}
          />
        </div>
        <div style={{ width: 90 }}>
          <CardCvcElement
            onChange={handleCardCvcChange}
            options={options}
          />
        </div>
      </Space>
      <Button
        type="primary"
        size="large"
        htmlType="submit"
        block
        disabled={loading || !isInfoComplete} loading={loading}
        style={{ marginTop: 10 }}>
        Add Payment Method
        </Button>
    </form>
  )
}

const StripeCardPaymentWidget = props => (<Elements stripe={stripePromise}>
  <StripeCardPaymentForm onLoading={props.onLoading} onComplete={props.onComplete}/>
</Elements>)


StripeCardPaymentWidget.propTypes = {
  onLoading: PropTypes.func.isRequired,
};

StripeCardPaymentWidget.defaultProps = {
};

export default StripeCardPaymentWidget;
