import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Form, Drawer, InputNumber } from 'antd';
import {
  PlusOutlined
} from '@ant-design/icons';

import { Space } from 'antd';
import { listPromotions$, savePromotion$, newPromotionCode$ } from 'services/promotionService';
import { TimeAgo } from 'components/TimeAgo';
import { DatePicker } from 'antd';
import PropTypes from 'prop-types';
import { ClickToCopyTooltip } from 'components/ClickToCopyTooltip';
import { compareDates } from 'util/compareDates';
import { finalize } from 'rxjs';
import { Switch } from 'antd';
import MoneyAmount from 'components/MoneyAmount';
import moment from 'moment';

const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
`;




const PromotionListPanel = (props) => {

  const { org, onOk } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [newCode, setNewCode] = React.useState();

  const isValidCode = promotion => {
    return promotion.active && moment(promotion.endingAt).isAfter();
  }
  const columnDef = [
    {
      title: 'Code',
      dataIndex: 'code',
      fixed: 'left',
      render: (value, item) => <ClickToCopyTooltip value={value}>
        <Text strong type={isValidCode(item) ? "success" : 'secondary'} delete={!isValidCode(item)} style={{ fontSize: 18 }}>{value}</Text>
      </ClickToCopyTooltip>
    },
    {
      title: 'Created at',
      dataIndex: 'createdAt',
      sorter: {
        compare: (a, b) => compareDates(a.createdAt, b.createdAt)
      },
      render: (value) => <TimeAgo value={value} />
    },
    {
      title: 'End',
      dataIndex: 'endingAt',
      sorter: {
        compare: (a, b) => compareDates(a.endingAt, b.endingAt)
      },
      render: (value) => <TimeAgo value={value} />
    },
    {
      title: 'Promotion plan price',
      dataIndex: 'promotionPlanPrice',
      align: 'right',
      sorter: {
        compare: (a, b) => a.promotionPlanPrice - b.promotionPlanPrice
      },
      render: (value) => <MoneyAmount value={value} />,
    },
  ];

  const loadList$ = () => {
    setLoading(true);

    return listPromotions$(org.id)
      .pipe(
        finalize(() => setLoading(false))
      ).subscribe(list => setList(list));
  }

  React.useEffect(() => {
    const load$ = loadList$();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleNewPromotionCode = () => {
    newPromotionCode$(org.id).subscribe(code => {
      setNewCode(code);
      setModalVisible(true);
    })
  }

  const handleSavePromotion = async values => {
    const payload = {
      ...values,
      orgId: org.id
    };
    savePromotion$(payload).subscribe(() => {
      setModalVisible(false);
      loadList$();
    });
  }

  return (
    <ContainerStyled>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={() => handleNewPromotionCode()} icon={<PlusOutlined />}>New Promotion Code</Button>
        </Space>
        <Table columns={columnDef}
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          rowKey="code"
          loading={loading}
          style={{ marginTop: 20 }}
          pagination={false}
        />
      </Space>
      <Drawer
        open={modalVisible}
        destroyOnClose={true}
        maskClosable={true}
        onClose={() => setModalVisible(false)}
        title={<>New Promotion Code</>}
        footer={null}
        width={400}
      >
        <Form layout="horizontal"
          onFinish={handleSavePromotion}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          requiredMark={false}
          initialValues={{ code: newCode, promotionPlanPrice: 39 }}>
          <Form.Item label="Code" name="code" rules={[{ required: true, whitespace: true }]}>
            <Input readOnly={true} />
          </Form.Item>
          <Form.Item label="Plan price" name="promotionPlanPrice" rules={[{ required: true, type: 'number', min: 0, max: 100, whitespace: true }]}>
            <InputNumber
              min={0}
              max={100}
              step={1}
              addonBefore="$"
              precision={2}
            // formatter={value => `$ ${value}`}
            // parser={value => +(value.replace('$ ', ''))}
            />
          </Form.Item>
          <Form.Item label="End" name="endingAt" rules={[{ required: true, type: 'date', whitespace: true }]}>
            <DatePicker type="date" />
          </Form.Item>
          <Form.Item label="Apply now?" name="applyNow" extra="Should apply this discount to the org's current unpaid billing period? Otherwise it will take effect starting from the next billing period.">
            <Switch />
          </Form.Item>
          <Form.Item wrapperCol={{ span: 24 }}>
            <Button block type="primary" htmlType="submit" disabled={loading}>Create</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </ContainerStyled>

  );
};

PromotionListPanel.propTypes = {
  org: PropTypes.object.isRequired,
  onOk: PropTypes.func.isRequired,
};

PromotionListPanel.defaultProps = {};

export default PromotionListPanel;
