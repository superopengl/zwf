import { Card, Button, Modal, Space, Typography, Tag, List } from 'antd';
import React from 'react';

import { Loading } from 'components/Loading';
import { CloseCircleFilled, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { deleteOrgPaymentMethod$, listOrgPaymentMethods$, setOrgPrimaryPaymentMethod$ } from 'services/orgPaymentMethodService';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import { saveOrgPaymentMethod } from 'services/orgPaymentMethodService';
// import { PageContainer } from '@ant-design/pro-layout';
import { PageContainer, ProCard, ProList } from '@ant-design/pro-components';

const { Text } = Typography;

const OrgPaymentMethodPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);

  const load$ = () => {
    setLoading(true);
    return listOrgPaymentMethods$()
      .subscribe(list => setList(list))
      .add(() => setLoading(false));
  }

  React.useEffect(() => {
    const sub$ = load$();
    return () => {
      sub$?.unsubscribe();
    }
  }, []);

  const handleSavePayment = async (stripePaymentMethodId) => {
    await saveOrgPaymentMethod(stripePaymentMethodId);
    setModalVisible(false);
    load$();
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
          load$();
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
          load$();
        })
      },
      okText: 'Yes, use this',
      okButtonProps: {
        type: 'primary'
      }
    })
  }

  return (
    <PageContainer
      loading={loading}
      fixedHeader
      header={{
        title: 'Payment Methods',
        extra: [
          <Button key="add" type="primary" ghost icon={<PlusOutlined />} onClick={() => handleAddNew()}>Add New Method</Button>
        ]
      }}
    >
      <ProList
        loading={loading}
        dataSource={list}
        split={true}
        rowKey="id"
        ghost={true}
        // toolBarRender={() => <Button key="add" type="primary" ghost icon={<PlusOutlined />} onClick={() => handleAddNew()}>Add New Method</Button>}
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 2, xl: 2, xxl: 3 }}
        metas={{
          title: {
            render: (value, item) => <Text strong={item.primary}>
              XXXX-XXXX-XXXX-{item.cardLast4}
            </Text>
          },
          content: {
            render: (value, item) => <Space size="large">
              <Text>{item.cardBrand}</Text>
              <Text>{item.cardExpiry}</Text>
            </Space>
          },
          // subTitle: {
          //   render: (value, item) => item.primary ? <Tag color="#0FBFC4">being used</Tag> : null
          // },
          actions: {
            render: (value, item) => item.primary ? [
              <Tag key="tag" color="#0FBFC4">being used</Tag>
            ] : [
              <Button key="primary" type="text" onClick={() => handleSetPrimary(item)} size="small">Set Primary</Button>,
              <Button key="delete" type="text" danger onClick={() => handleDelete(item)} size="small">Remove</Button>
            ]
          }
        }}
      />

      <Modal
        open={modalVisible}
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
    </PageContainer>
  );
};

OrgPaymentMethodPage.propTypes = {};

OrgPaymentMethodPage.defaultProps = {};

export default OrgPaymentMethodPage;
