import { Tag, Space, Table, Button, Typography, Row, Col } from 'antd';
import React from 'react';

import { TimeAgo } from 'components/TimeAgo';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadReceipt } from 'services/subscriptionService';
import { ArrowRightOutlined } from '@ant-design/icons';
import MoneyAmount from 'components/MoneyAmount';
import { orderBy } from 'lodash';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const { Text } = Typography;

const StyledReceiptTable = styled(Table)`
.ant-table {
  margin: -8px !important;
}
`;

export const OrgSubscriptionHistoryPanel = (props) => {
  const { data } = props;
  const [list, setList] = React.useState(data || []);

  React.useEffect(() => {
    setList(data);
  }, [data]);

  const handleReceipt = async (paymentId) => {
    const data = await downloadReceipt(paymentId);
    const fileUrl = URL.createObjectURL(data);
    window.open(fileUrl);
  }

  const columnDef = [
    {
      title: 'Period from',
      align: 'left',
      render: (value, item) => {
        return <Space>
          <TimeAgo value={item.startAt} showAgo={false} accurate={false} />
          {/* <DoubleRightOutlined /> */}
          {/* {item.recurring && <Tag>auto renew</Tag>} */}
          {!item.endedAt && moment(item.startAt).isBefore() && moment(item.endingAt).isAfter() && <Tag>current</Tag>}
          {/* {moment(item.createdAt).isAfter(moment()) && <Tag color="warning">new purchase</Tag>} */}
          {/* {moment().isBefore(moment(item.start).startOf('day')) && <Tag>Furture</Tag>} */}
        </Space>
      }
    },
    {
      title: 'End',
      align: 'left',
      render: (value, item) => {
        return item.endingAt ? <TimeAgo value={item.endingAt} showAgo={false} accurate={false} /> : null;
      }
    },
    {
      title: 'Days',
      align: 'center',
      render: (value, item) => {
        return item.endingAt ? <Text>{moment(item.endingAt).diff(moment(item.startAt), 'days') + 1}</Text> : null;
      }
    },
    {
      title: 'Licenses',
      dataIndex: 'seats',
      align: 'center',
      render: (value, item) => {
        return value
      }
    },
    {
      title: 'Billing',
      dataIndex: 'payment',
      align: 'center',
      width: 370,
      render: (payment, item) => {
        if(item.type === 'trial') {
          return 'Single license free trial'
        }
        if (!payment) return null;

        const { amount, createdAt, id } = payment;
        return <Row align="middle">
          <Col span={8}>
            <MoneyAmount value={amount} />
          </Col>
          <Col span={8}>
            <TimeAgo value={createdAt} showAgo={false} accurate={false} />
          </Col>
          <Col span={8}>
            <Button type="link" size="small" onClick={() => handleReceipt(payment.id)} icon={<DownloadOutlined />}>Receipt</Button>
          </Col>
        </Row>
      }
    },
  ];

  return (
    <Table
      // showHeader={false}
      showHeader={true}
      style={{ width: '100%' }}
      scroll={{ x: 'max-content' }}
      dataSource={list}
      columns={columnDef}
      size="small"
      pagination={false}
      rowKey="id"
      bordered={false}
    />
  );
};

OrgSubscriptionHistoryPanel.propTypes = {
  data: PropTypes.array.isRequired
};

OrgSubscriptionHistoryPanel.defaultProps = {
  data: []
};

