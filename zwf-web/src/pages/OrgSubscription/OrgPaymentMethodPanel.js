import { Card, Button, Modal, Space, Typography, Tag, List, Descriptions, Row, Col } from 'antd';
import React from 'react';

import { Loading } from 'components/Loading';
import { CloseCircleFilled, CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { deleteOrgPaymentMethod$, listOrgPaymentMethods$, setOrgPrimaryPaymentMethod$ } from 'services/orgPaymentMethodService';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import { saveOrgPaymentMethod$ } from 'services/orgPaymentMethodService';
import { PageContainer, ProCard, ProList } from '@ant-design/pro-components';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { switchMap } from 'rxjs';
import { useAddPaymentMethodModal } from 'hooks/useAddPaymentMethodModal';
import Visa from "react-pay-icons/lib/Visa";
import Mastercard from "react-pay-icons/lib/Mastercard";

const { Text, Paragraph } = Typography;

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

  .ant-list-footer {
    display: flex;
    justify-content: flex-end;
  }
`

export const OrgPaymentMethodPanel = () => {

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [openAddPaymentModal, modalContextHolder] = useAddPaymentMethodModal();

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

  const handleAddNew = () => {
    openAddPaymentModal(() => {
      load$();
    });
  }

  const handleDelete = (item) => {
    modal.confirm({
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
      },
      cancelButtonProps: {
        type: 'text'
      }
    })
  }

  const handleSetPrimary = (item) => {
    modal.confirm({
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
      },
      cancelButtonProps: {
        type: 'text'
      }
    })
  }

  return (
    <Container>
      <StyledList
        dataSource={list}
        loading={loading}
        grid={{ column: 1, gutter: 24 }}
        footer={list.length ? <Button key="add" type="primary" ghost icon={<PlusOutlined />} onClick={() => handleAddNew()}>Add Payment Method</Button> : null}
        locale={{
          emptyText: <>
            <Paragraph type="secondary">
              There is no payment method.
            </Paragraph>
            <Button type="link" ghost onClick={() => handleAddNew()}>Add payment method</Button>
          </>
        }}
        renderItem={item => <List.Item>
          <ProCard
            title={<Text strong={item.primary} style={{ fontSize: 18 }}>
              **** **** **** {item.cardLast4}
            </Text>}
            // subTitle={item.primary ? <Tag key="tag" color="cyan">Being used</Tag> : null}
            style={{ borderColor: item.primary ? '#0FBFC4' : undefined }}
            bordered
            extra={item.primary ? [
              <Tag key="tag" color="#0FBFC4">Primary</Tag>
            ] : [
              <Button key="primary" type="link" onClick={() => handleSetPrimary(item)} size="small">Use this</Button>,
              <Button key="delete" type="text" danger onClick={() => handleDelete(item)} size="small">Remove</Button>
            ]}
          >
            <Row wrap={false} justify="space-between" align="top">
              <Col>
                <Descriptions colon={false}>
                  <Descriptions.Item label="Expiry">{item.cardExpiry}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col>
                {item.cardBrand === 'visa' ? <Visa style={{ marginRight: 8, width: 60 }} /> :
                  item.cardBrand === 'master' ? <Mastercard style={{ marginRight: 8, width: 60 }} /> :
                    item.cardBrand}
              </Col>
            </Row>
          </ProCard>
        </List.Item>}
      />
      <>{contextHolder}</>
      <>{modalContextHolder}</>
    </Container>
  );
};

OrgPaymentMethodPanel.propTypes = {};

OrgPaymentMethodPanel.defaultProps = {};

