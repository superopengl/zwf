import { Card, Button, Modal, Space, Typography, Row, Col, Tag, List } from 'antd';
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
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { deleteOrgPaymentMethod$, listOrgPaymentMethods$, setOrgPrimaryPaymentMethod$ } from 'services/orgPaymentMethodService';
import StripeCardPaymentWidget from './StripeCardPaymentWidget';

const PaymentStepperWidget = loadable(() => import('components/checkout/PaymentStepperWidget'));

const { Paragraph, Text, Title, Link } = Typography;


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

const OrgPaymentMethodPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [load$, setLoad$] = React.useState();

  const load = () => {
    setLoading(true);
    load$?.unsubscribe();
    return listOrgPaymentMethods$()
      .subscribe(list => setList(list))
      .add(() => setLoading(false));
  }

  React.useEffect(() => {
    setLoad$(load());
    return () => {
      load$?.unsubscribe();
    }
  }, []);

  const handlePaymentOk = async () => {
    setModalVisible(false);
    load();
  }

  const hideModal = () => {
    setModalVisible(false);
  }

  const handleAddNew = () => {
    setModalVisible(true);
  }

  const handleDelete = (item) => {
    Modal.confirm({
      title: 'Remove payment method',
      content: `Delete card XXXX-XXXX-XXXX-${item.cardLast4}?`,
      closable: true,
      maskClosable: true,
      onOk: () => {
        deleteOrgPaymentMethod$(item.id).subscribe(() => {
          load();
        })
      },
      okText: 'Yes, delete it',
      okButtonProps: {
        danger: true
      }
    })
  }

  const handleSetPrimary = (item) => {
    Modal.confirm({
      title: 'Set primary payment method',
      content: `Use card XXXX-XXXX-XXXX-${item.cardLast4} from next payment?`,
      closable: true,
      maskClosable: true,
      onOk: () => {
        setOrgPrimaryPaymentMethod$(item.id).subscribe(() => {
          load();
        })
      },
      okText: 'Yes, use this',
      okButtonProps: {
        type: 'primary'
      }
    })
  }

  
  return (
    <ContainerStyled>
      <Loading loading={loading} style={{ width: '100%' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', justifyContent: 'center' }}>
          <Card
            bordered={false}
            title="Payment Methods"
            style={{ width: '100%' }}
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddNew()}>Add New Method</Button>
            }
          >
            <List
              dataSource={list}
              loading={loading}
              locale={{
                emptyText: <>
                  No payment method is set.<br />
                  <Button type="link" onClick={handleAddNew}>Click to add new payment method</Button>
                </>
              }}
              renderItem={item => <List.Item
                actions={item.primary ? null : [
                  <Button key="primary" type="primary" ghost onClick={() => handleSetPrimary(item)}>Set Primary</Button>,
                  <Button key="delete" ghost type="danger" onClick={() => handleDelete(item)}>Remove</Button>
                ]}
              >
                <Space size="large">
                  <Text>XXXX-XXXX-XXXX-{item.cardLast4}</Text>
                  <Text>{item.cardExpiry}</Text>
                  {item.primary && <Tag key="tag" color="#4c1bb3">primary</Tag>}
                </Space>
              </List.Item>}
            />
          </Card>
        </Space>
      </Loading>
      <Modal
        visible={modalVisible}
        closable={!paymentLoading}
        maskClosable={false}
        title="Payment Method"
        destroyOnClose
        footer={null}
        width={460}
        onOk={hideModal}
        onCancel={hideModal}
      >
        <Loading loading={paymentLoading}>
          <StripeCardPaymentWidget
            onComplete={handlePaymentOk}
            onLoading={loading => setPaymentLoading(loading)}
          />

        </Loading>
      </Modal>
    </ContainerStyled>
  );
};

OrgPaymentMethodPage.propTypes = {};

OrgPaymentMethodPage.defaultProps = {};

export default withRouter(OrgPaymentMethodPage);
