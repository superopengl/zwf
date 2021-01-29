import { Button, Layout, Card, Space, Typography, Row, Col, Spin } from 'antd';
import HomeHeader from 'components/HomeHeader';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { SyncOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { getStats } from 'services/statsService';
import { MdOpenInNew } from 'react-icons/md';
import { DonutChart } from "bizcharts";
import { Loading } from 'components/Loading';

const { Text } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 1000px;

  .ant-divider {
    margin: 8px 0 24px;
  }
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .task-count .ant-badge-count {
    background-color: #183e91;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #183e91 inset;
  }
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

const StatCard = (props) => {
  const { title, value, loading, color } = props;


  const data = Object.entries(value || {}).map(([k, v]) => ({type: k, value: v}));

  return <Card title={title} style={{ marginTop: 20 }}>
    {loading ? <Loading /> : <Space direction="vertical" style={{ width: '100%', alignItems: 'center' }}>
      <DonutChart
        data={data || []}
        // title={{
        //   visible: false,
        //   text: "环图",
        // }}
        forceFit
        // description={{
        //   visible: false,
        //   text: "环图的外半径决定环图的大小，而内半径决定环图的厚度。",
        // }}
        radius={0.8}
        padding="auto"
        angleField="value"
        colorField="type"
        pieStyle={{ stroke: "white", lineWidth: 5 }}
        statistic={{
          totalLabel: 'Total',

        }}
        legend={{
          position: 'top-center'
        }}
        color={color || ['#91d5ff','#096dd9','#d3adf7', '#722ed1', '#22075e']}
      />
      <Space style={{ width: '100%', justifyContent: 'space-between' }} size="large">
        {Object.entries(value).map(([k, v], i) => <div key={i}>{k} <Text style={{ fontSize: 28 }} type="secondary" strong>{v}</Text></div>)}
      </Space>
    </Space>}
  </Card>
}

const AdminStatsPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState();

  const loadEntity = async () => {
    setLoading(true);
    const stats = await getStats();
    setStats(stats);
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity()
  }, []);

  return (
    <LayoutStyled>
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space style={{width: '100%', justifyContent: 'flex-end'}}>

        <Button onClick={() => loadEntity()} icon={<SyncOutlined />}></Button>
        </Space>
        <Row gutter={40}>
          <Col {...span}>
            <StatCard title={<Link to="/user">User <MdOpenInNew /></Link>} value={stats?.user} loading={loading} color={['#b37feb', '#91d5ff', '#1890ff']} />
          </Col>
          <Col {...span}>
            <StatCard title="Portfolio" value={stats?.portfolio} loading={loading} />
          </Col>
          <Col {...span} >
            <StatCard title={<Link to="/tasks">Task <MdOpenInNew /></Link>} value={stats?.task} loading={loading} color={['#91d5ff', '#ff7875', '#1890ff', '#87e8de', '#b37feb']}/>
          </Col>
        </Row>
      </ContainerStyled>
    </LayoutStyled >
  );
};

AdminStatsPage.propTypes = {};

AdminStatsPage.defaultProps = {};

export default withRouter(AdminStatsPage);
