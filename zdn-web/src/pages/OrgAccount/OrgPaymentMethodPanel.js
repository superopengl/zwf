import { Card, Button, Modal, Space, Typography, Tag, List } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Loading } from 'components/Loading';
import { PlusOutlined } from '@ant-design/icons';
import { deleteOrgPaymentMethod$, listOrgPaymentMethods$, setOrgPrimaryPaymentMethod$ } from 'services/orgPaymentMethodService';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import { getPaymentMethodSecret$, saveOrgPaymentMethod$ } from 'services/orgPaymentMethodService';

const { Text } = Typography;

const OrgPaymentMethodPanel = () => {

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

  const handleSavePayment = async (paymentId, payload) => {
    const { stripePaymentMethodId } = payload;
    savePaymentMethod(stripePaymentMethodId);
    setModalVisible(false);
    load();
  }

  const hideModal = () => {
    setModalVisible(false);
  }

  const handleAddNew = () => {
    setModalVisible(true);
  }

  const getClientSecret = async () => {
    const result = await getPaymentMethodSecret$().toPromise();
    return result.clientSecret;
  }

  const savePaymentMethod = async (paymentMethodId) => {
    await saveOrgPaymentMethod$(paymentMethodId).toPromise();
  }

  const handleDelete = (item) => {
    Modal.confirm({
      title: 'Remove payment method',
      content: <>Delete card <Text code>{item.cardLast4}</Text>?</>,
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
      content: <>Set card <Text code>{item.cardLast4}</Text> as primary payment method for future payment?</>,
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

  const handleGetClientSecret = async () => {
    const clientSecret = await getClientSecret();
    return { clientSecret };
  }

  return (
    <Loading loading={loading} style={{ width: '100%' }}>
      <Card
        bordered={false}
        title="Payment Methods"
        style={{ width: '100%' }}
        extra={
          <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleAddNew()}>Add New Method</Button>
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
            actions={item.primary || list.length <= 1 ? null : [
              <Button key="primary" type="primary" ghost onClick={() => handleSetPrimary(item)}>Set Primary</Button>,
              <Button key="delete" ghost type="danger" onClick={() => handleDelete(item)}>Remove</Button>
            ]}
          >
            <Space size="large">
              <Text code>XXXX-XXXX-XXXX-{item.cardLast4}</Text>
              <Text>{item.cardExpiry}</Text>
              {item.primary && <Tag key="tag" color="#13c2c2">primary</Tag>}
            </Space>
          </List.Item>}
        />
      </Card>
      <Modal
        visible={modalVisible}
        closable={!paymentLoading}
        maskClosable={false}
        title="Add Payment Method"
        destroyOnClose
        footer={null}
        width={460}
        onOk={hideModal}
        onCancel={hideModal}
      >
        <Loading loading={paymentLoading}>
          <StripeCardPaymentWidget
            onProvision={handleGetClientSecret}
            onCommit={handleSavePayment}
            onLoading={loading => setPaymentLoading(loading)}
            buttonText="Add this card"
          />

        </Loading>
      </Modal>
    </Loading>
  );
};

OrgPaymentMethodPanel.propTypes = {};

OrgPaymentMethodPanel.defaultProps = {};

export default withRouter(OrgPaymentMethodPanel);
