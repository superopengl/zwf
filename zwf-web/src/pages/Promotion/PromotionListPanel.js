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
import {ClickToCopyTooltip} from 'components/ClickToCopyTooltip';
import { compareDates } from 'util/compareDates';

const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
`;




const PromotionListPanel = (props) => {

  const { org, onOk } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [newCode, setNewCode] = React.useState();


  const columnDef = [
    {
      title: 'Code',
      dataIndex: 'code',
      fixed: 'left',
      render: (value) => <ClickToCopyTooltip value={value}>
        <Text strong type="success" style={{ fontSize: 18 }}>{value}</Text>
      </ClickToCopyTooltip>
    },
    {
      title: '% off',
      dataIndex: 'percentage',
      sorter: {
        compare: (a, b) => a.percentage - b.percentage
      },
      render: (value) => <>{value * 100} %</>,
    },
    {
      title: 'End',
      dataIndex: 'end',
      sorter: {
        compare: (a, b) => compareDates(a.end, b.end)
      },
      render: (value) => <TimeAgo value={value} />
    },
    {
      title: 'Created at',
      dataIndex: 'createdAt',
      sorter: {
        compare: (a, b) => compareDates(a.createdAt, b.createdAt)
      },
      render: (value) => <TimeAgo value={value} />
    },
  ];

  const loadList = () => {
    setLoading(true);

    return listPromotions$().subscribe(
      list => setList(list),
    ).add(() => {
      setLoading(false);
    });
  }

  React.useEffect(() => {
    const load$ = loadList();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleNewPromotionCode = () => {
    newPromotionCode$().subscribe(code => {
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
      loadList();
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
        visible={modalVisible}
        destroyOnClose={true}
        maskClosable={true}
        onClose={() => setModalVisible(false)}
        title={<>New Promotion Code</>}
        footer={null}
        width={300}
      >
        <Form layout="horizontal"
          onFinish={handleSavePromotion}
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          initialValues={{ code: newCode, percentage: 0.1 }}>
          <Form.Item label="Code" name="code" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <Input readOnly={true} />
          </Form.Item>
          <Form.Item label="% off" name="percentage" rules={[{ required: true, type: 'number', min: 0.01, max: 0.99, whitespace: true }]}>
            <InputNumber
              min={0.01}
              max={0.99}
              step={0.01}
              formatter={value => `${value * 100} %`}
              parser={value => +(value.replace(' %', '')) / 100}
            />
          </Form.Item>
          <Form.Item label="End" name="end" rules={[{ required: true, type: 'date', whitespace: true, message: ' ' }]}>
            <DatePicker type="date" />
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
