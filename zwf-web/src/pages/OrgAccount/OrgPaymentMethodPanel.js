import { Card, Button, Modal, Space, Typography, Tag, List } from 'antd';
import React from 'react';

import { Loading } from 'components/Loading';
import { PlusOutlined } from '@ant-design/icons';
import { deleteOrgPaymentMethod$, listOrgPaymentMethods$, setOrgPrimaryPaymentMethod$ } from 'services/orgPaymentMethodService';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import { saveOrgPaymentMethod } from 'services/orgPaymentMethodService';

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

  const handleSavePayment = async (stripePaymentMethodId) => {
    await saveOrgPaymentMethod(stripePaymentMethodId);
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

  return (
    <Loading loading={loading} style={{ width: '100%' }}>
      <Card
        bordered={false}
        title="Payment Methods"
        style={{ width: '100%' }}
        bodyStyle={{paddingTop: 0, paddingBottom: 0}}
        extra={
          <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleAddNew()}>Add New Method</Button>
        }
      >
        <List
          dataSource={list}
          loading={loading}
          bordered={false}
          locale={{
            emptyText: <>
              No payment method is set.<br />
              <Button type="link" onClick={handleAddNew}>Click to add new payment method</Button>
            </>
          }}
          renderItem={item => <List.Item
            actions={item.primary || list.length <= 1 ? null : [
              <Button key="primary" type="link" onClick={() => handleSetPrimary(item)} size="small">Set Primary</Button>,
              <Button key="delete" type="link" danger onClick={() => handleDelete(item)} size="small">Remove</Button>
            ]}
          >
            <Space size="large">
              <Text code>XXXX-XXXX-XXXX-{item.cardLast4}</Text>
              <Text>{item.cardBrand}</Text>
              <Text>{item.cardExpiry}</Text>
              {item.primary && <Tag key="tag" color="#0FBFC4">primary</Tag>}
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
            onOk={handleSavePayment}
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

export default OrgPaymentMethodPanel;
