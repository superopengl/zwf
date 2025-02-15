import { Tag, Space, Table, Button, Row, Col, Typography } from 'antd';
import React from 'react';

import { TimeAgo } from 'components/TimeAgo';
import { DownloadOutlined } from '@ant-design/icons';
import { getInvoiceUrl } from 'services/billingService';
import MoneyAmount from 'components/MoneyAmount';
import { finalize } from 'rxjs/operators';
import { listMyInvoices$ } from 'services/billingService';

const {Text} = Typography;

export const OrgSubscriptionHistoryPanel = () => {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const sub$ = listMyInvoices$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(data => setList(data));

    return () => {
      sub$.unsubscribe();
    }
  }, []);

  const columns = [
    {
      title: 'Period',
      align: 'left',
      render: (value, item) => {
        return <Space>
          <TimeAgo value={item.periodFrom} showAgo={false} accurate={false} />
          -
          <TimeAgo value={item.periodTo} showAgo={false} accurate={false} />
          <Text>({item.periodDays} days)</Text>
          {/* <DoubleRightOutlined /> */}
          {/* {item.recurring && <Tag>auto renew</Tag>} */}
          {item.tail && <Tag>current</Tag>}
          {/* {moment(item.createdAt).isAfter(moment()) && <Tag color="warning">new purchase</Tag>} */}
          {/* {moment().isBefore(moment(item.start).startOf('day')) && <Tag>Furture</Tag>} */}
        </Space>
      }
    },
    {
      title: 'Type',
      align: 'left',
      render: (value, item) => {
        return item.type === 'trial' ? 'Free Trial' : 'Monthly';
      }
    },
    {
      title: 'Paid at',
      align: 'left',
      render: (value, item) => {
        return <TimeAgo value={item.checkoutDate} showAgo={false} accurate={false} />
      }
    },
    {
      title: 'Amount',
      align: 'right',
      render: (value, item) => {
        return item.checkoutDate ? <MoneyAmount value={item.payable} /> : null;
      }
    },

    {
      title: 'Billing',
      align: 'center',
      render: (value, item) => {
        return item.checkoutDate ? <Button type="link" target="_blank" href={getInvoiceUrl(item.invoiceFileId)} icon={<DownloadOutlined />}>Invoice</Button> : null;
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

