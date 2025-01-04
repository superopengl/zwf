import { Tag, Space, Table, Button, Row, Col } from 'antd';
import React from 'react';

import { TimeAgo } from 'components/TimeAgo';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadReceipt } from 'services/subscriptionService';
import MoneyAmount from 'components/MoneyAmount';
import { finalize } from 'rxjs/operators';
import { listMySubscriptions$ } from 'services/subscriptionService';

export const OrgSubscriptionHistoryPanel = () => {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const sub$ = listMySubscriptions$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(data => setList(data));

    return () => {
      sub$.unsubscribe();
    }
  }, []);

  const handleReceipt = async (paymentId) => {
    await downloadReceipt(paymentId);
  }

  const columns = [
    {
      title: 'Type',
      align: 'left',
      render: (value, item) => {
        return item.type === 'trial' ? 'Trial' : 'Monthly';
      }
    },
    {
      title: 'Days',
      align: 'center',
      render: (value, item) => {
        return item.periodDays;
      }
    },
    {
      title: 'Period',
      align: 'left',
      render: (value, item) => {
        return <Space>
          <TimeAgo value={item.periodFrom} showAgo={false} accurate={false} />
          -
          <TimeAgo value={item.periodTo} showAgo={false} accurate={false} />
          {/* <DoubleRightOutlined /> */}
          {/* {item.recurring && <Tag>auto renew</Tag>} */}
          {item.latest && <Tag>current</Tag>}
          {/* {moment(item.createdAt).isAfter(moment()) && <Tag color="warning">new purchase</Tag>} */}
          {/* {moment().isBefore(moment(item.start).startOf('day')) && <Tag>Furture</Tag>} */}
        </Space>
      }
    },
    {
      title: 'Billing',
      align: 'center',
      width: 370,
      render: (value, item) => {
        if(item.type === 'trial') {
          return 'Free trial'
        }

        if(!item.paymentId) {
          return 'Pending'
        }

        const { payable, issuedAt, paymentId } = item;
        return <Row align="middle">
          <Col span={8}>
          <MoneyAmount value={payable} />
          </Col>
          <Col span={8}>
            <TimeAgo value={issuedAt} showAgo={false} accurate={false} />
          </Col>
          <Col span={8}>
            <Button type="link" size="small" onClick={() => handleReceipt(paymentId)} icon={<DownloadOutlined />}>Receipt</Button>
          </Col>
        </Row>
      }
    },
  ];

  return (
    <Table
      // showHeader={false}
      loading={loading}
      showHeader={true}
      style={{ width: '100%' }}
      scroll={{ x: 'max-content' }}
      dataSource={list}
      columns={columns}
      size="small"
      pagination={false}
      rowKey="id"
      bordered={false}
    />
  );
};

OrgSubscriptionHistoryPanel.propTypes = {
};

OrgSubscriptionHistoryPanel.defaultProps = {
};

