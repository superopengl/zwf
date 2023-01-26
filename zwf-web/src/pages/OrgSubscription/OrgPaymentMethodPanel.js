import { Card, Button, Modal, Space, Typography, Tag, List, Descriptions, Row } from 'antd';
import React from 'react';

import { Loading } from 'components/Loading';
import { CloseCircleFilled, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { deleteOrgPaymentMethod$, listOrgPaymentMethods$, setOrgPrimaryPaymentMethod$ } from 'services/orgPaymentMethodService';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import { saveOrgPaymentMethod } from 'services/orgPaymentMethodService';
// import { PageContainer } from '@ant-design/pro-layout';
import { PageContainer, ProCard, ProList } from '@ant-design/pro-components';
import styled from 'styled-components';

const { Text } = Typography;

const Container = styled.div`
width: 100%;
display: flex;
justify-content: center;
`

const StyledList = styled(List)`
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  .ant-list-item {
    padding: 0;
  }
`

export const OrgPaymentMethodPanel = () => {

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
    <Container>
      <StyledList
        dataSource={list}
        grid={{ column: 1, gutter: 24 }}
        footer={<Button key="add" type="primary" ghost icon={<PlusOutlined />} onClick={() => handleAddNew()}>Add New Method</Button>}
        renderItem={item => <List.Item>
          <ProCard
            title={<Text strong={item.primary} style={{fontSize: 18}}>
              **** **** **** {item.cardLast4}
            </Text>}
            subTitle={item.primary ? <Tag key="tag" color="cyan">Primary</Tag> : null}
            extra={item.primary ? [
            ] : [
              <Button key="primary" type="link" size="small" onClick={() => handleSetPrimary(item)} size="small">Set Primary</Button>,
              <Button key="delete" type="text" size="small" danger onClick={() => handleDelete(item)} size="small">Remove</Button>
            ]}
          >
            <Descriptions colon={false} labelStyle={{ opacity: 0.6 }}>
              <Descriptions.Item label="Expiry">{item.cardExpiry}</Descriptions.Item>
            </Descriptions>
          </ProCard>
        </List.Item>}
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
        bodyStyle={{paddingTop: 24}}
      >
        <Loading loading={paymentLoading}>
          <StripeCardPaymentWidget
            onOk={handleSavePayment}
            onLoading={loading => setPaymentLoading(loading)}
            buttonText="Add this card"
          />
        </Loading>
      </Modal>
    </Container>
  );
};

OrgPaymentMethodPanel.propTypes = {};

OrgPaymentMethodPanel.defaultProps = {};

