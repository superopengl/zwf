import React from 'react';
import { Typography, Space, Select, Button, Card } from 'antd';

import RevenueChart from 'components/charts/RevenueChart';
import { Loading } from 'components/Loading';
import { getRevenueChartData } from 'services/revenueService';
import { SyncOutlined } from '@ant-design/icons';
import { useAssertRole } from 'hooks/useAssertRole';

const { Text, Paragraph } = Typography;

const RevenuePage = () => {
  useAssertRole(['system']);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);
  const [period, setPeriod] = React.useState('month');

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getRevenueChartData(period);
      setData(data);
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadData();
  }, [period]);

  const handleRefresh = () => {
    loadData();
  }

  return (
    <Loading loading={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>

          <Select defaultValue={period} onChange={setPeriod} style={{ width: 100 }}>
            <Select.Option value="day">Daily</Select.Option>
            {/* <Select.Option value="week">Weekly</Select.Option> */}
            <Select.Option value="month">Monthly</Select.Option>
            <Select.Option value="year">Yearly</Select.Option>
          </Select>
          <Button type="primary" icon={<SyncOutlined />} onClick={handleRefresh}>Refresh</Button>
        </Space>
        <Card>

          <RevenueChart value={data} />
        </Card>
      </Space>
    </Loading>
  );
};

RevenuePage.propTypes = {};

RevenuePage.defaultProps = {};

export default RevenuePage;
