import { Tag, Space, Typography, Table, Drawer, Button } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { getSubscriptionName } from 'util/getSubscriptionName';
import { TimeAgo } from 'components/TimeAgo';
import { DownloadOutlined } from '@ant-design/icons';
import { downloadReceipt, listMySubscriptionHistory } from 'services/subscriptionService';
import { ArrowRightOutlined } from '@ant-design/icons';
import MoneyAmount from 'components/MoneyAmount';
import {orderBy} from 'lodash';
import * as moment from 'moment';

const { Text, Link } = Typography;

const MySubscriptionHistoryDrawer = (props) => {
  const { visible, onClose, style } = props;
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  const loadSubscrptions = async () => {
    try {
      setLoading(true);

      setList(await listMySubscriptionHistory());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (visible) {
      loadSubscrptions();
    }
  }, [visible]);

  const handleReceipt = async (payment) => {
    const data = await downloadReceipt(payment.id);
    const fileUrl = URL.createObjectURL(data);
    window.open(fileUrl);
  }

  const columnDef = [
    {
      title: 'Subscription type',
      render: (value, item) => <Space>
        <Text strong={item.status === 'alive'}>
          {getSubscriptionName(item.type)}
        </Text>
        {item.status === 'alive' && <Tag color="warning">Current</Tag>}
      </Space>
    },
    {
      title: 'Subscription period',
      align: 'left',
      render: (value, item) => {
        return <Space>
          <TimeAgo value={item.start} showAgo={false} accurate={false} />
          <ArrowRightOutlined />
          {/* <DoubleRightOutlined /> */}
          <TimeAgo value={item.end} showAgo={false} accurate={false} />
          {item.recurring && <Tag color="success">Auto renew</Tag>}
        </Space>
      }
    },
    {
      title: 'Billings',
      dataIndex: 'payments',
      align: 'center',
      render: (payments, item) => {
        return <Table
          columns={[
            {
              title: 'link',
              dataIndex: 'amount',
              align: 'right',
              width: '33%',
              render: (amount, item) => <MoneyAmount value={amount} />
            },
            {
              title: 'link',
              dataIndex: 'createdAt',
              align: 'right',
              width: '33%',
              render: (createdAt, item) => <TimeAgo value={createdAt} showAgo={false} accurate={false} />
            },
            {
              title: 'link',
              dataIndex: 'id',
              width: '33%',
              align: 'right',
              render: (id, item) => <Button type="link" onClick={() => handleReceipt(item)} icon={<DownloadOutlined/>}>Receipt</Button>
            },
          ]}
          bordered={false}
          rowKey="id"
          showHeader={false}
          dataSource={orderBy(payments, [x => moment(x.paidAt).toDate()], 'desc')}
          pagination={false}
          style={{ width: '100%' }}
        />
      }
    },
  ];

  return (
    <Drawer
      title="Billing Information"
      width="80vw"
      destroyOnClose={true}
      maskClosable={true}
      visible={visible}
      onClose={onClose}
      style={style}
    >
      <Table
        // showHeader={false}
        loading={loading}
        style={{ width: '100%' }}
        dataSource={list}
        columns={columnDef}
        size="small"
        pagination={false}
        rowKey="id"
        bordered={false}
      />
    </Drawer>
  );
};

MySubscriptionHistoryDrawer.propTypes = {};

MySubscriptionHistoryDrawer.defaultProps = {};

export default withRouter(MySubscriptionHistoryDrawer);
