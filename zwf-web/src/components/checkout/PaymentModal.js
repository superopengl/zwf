import { Modal, Typography } from 'antd';
import React from 'react';

import styled from 'styled-components';
import { getMyCurrentSubscription, listMySubscriptionHistory } from 'services/subscriptionService';
import { getMyAccount } from 'services/accountService';
import { getAuthUser } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import loadable from '@loadable/component'
import { from } from 'rxjs';
import PropTypes from 'prop-types';

const PaymentStepperWidget = loadable(() => import('components/checkout/PaymentStepperWidget'));

const { Paragraph } = Typography;


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


const PaymentModal = (props) => {
  const { visible, onClose, onComplete } = props;

  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
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

      setAccount(account);
      setCurrentSubscription(subscription);
      if (refreshAuthUser) {
        context.setUser(user);
      }
      setSubscriptionHistory(subscriptionHistory);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
      const load$ = from(load(false)).subscribe();
      return () => {
        load$.unsubscribe();
      }
    }, []);


    const handlePaymentOk = async () => {
      setModalVisible(false);
      await load();
    }

    const handleCancelPayment = () => {
      setModalVisible(false);
    }



    return (
      <ContainerStyled>
        <Modal
          open={modalVisible}
          closable={!paymentLoading}
          maskClosable={false}
          title="Buy licenses"
          destroyOnClose
          footer={null}
          width={300}
          onOk={onClose}
          onCancel={onClose}
        >
          <PaymentStepperWidget
            onComplete={onComplete}
            onLoading={loading => setPaymentLoading(loading)}
          />
        </Modal>
      </ContainerStyled>
    );
  };

  PaymentModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
  };

  PaymentModal.defaultProps = {};

  export default PaymentModal;
