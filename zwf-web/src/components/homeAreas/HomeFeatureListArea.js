import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Col, Row, Space, Grid, Table } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { VscRocket } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import { subscriptionDef } from 'def/subscriptionDef';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const StyledRow = styled(Row)`
`;

const StyledCol = styled(Col)`
display: flex;
justify-content: center;
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 8,
  xl: 8,
  xxl: 8
};

const Container = styled.div`
justify-content: center;
margin-bottom: 6rem;
width: 100%;

// text-align: center;
// background: #fafafa;
// background: rgb(240, 242, 245);

.ant-table {
  font-size: 14px;
}
`;

const InnerContainer = styled.div`
width: 100%;
// background-color:  #F1F2F5;
// background-image: linear-gradient(5deg, #F1F2F5, #F1F2F5 50%, #ffffff 50%, #ffffff 100%);
padding: 3rem 1rem 1rem;
.price-card {
  max-width: 400px;
  background: #001A1F;
  box-shadow: 0px 0px 24px rgba(0, 26, 31, 0.36);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 24px;
  color: #EBEDF1CC;
  font-weight: 300;

  .ant-typography {
    color: #EBEDF1CC;
    font-weight: 300;
  }
}
`;



const orgFeatures = [
  { name: 'Status based task management', release: 'v1' },
  { name: 'Task assignment', release: 'v1' },
  { name: 'Scheduler to periodically create tasks', release: 'v1' },
  { name: 'Task template', release: 'v1' },
  { name: 'Doc template', release: 'v1' },
  { name: 'Realtime client communication', release: 'v1' },
  { name: 'Task event timeline', release: 'v1' },
  { name: 'Request client for actions', release: 'v1' },
  { name: 'Request client for Doc Sign', release: 'v1' },
  { name: 'Tags for task and user management', release: 'v1' },
  { name: 'Invite any clients by email addresses', release: 'v1' },
  { name: 'Google Single Sign On', release: 'v1' },
  // { name: 'Team metrics', dev: true },
].map((x, i) => ({
  key: i,
  name: x.name,
  extra: x.release ? `alive` : x.dev ? 'coming soon' : ''
}))



const clientFeatures = [
  { name: 'Realtime chat communication', release: 'v1' },
  // { name: 'Task event timeline', release: 'v1' },
  { name: 'Doc Sign', release: 'v1' },
  // { name: 'Doc Sign on blockchian', dev: true },
].map((x, i) => ({
  key: i,
  name: x.name,
  extra: x.release ? `alive` : x.dev ? 'coming soon' : ''
}))

export const HomeFeatureListArea = props => {
  const screens = useBreakpoint();

  const orgColumns = [
    {
      title: 'Org Portal',
      dataIndex: 'name',
      render: (text, item) => <Row justify='space-between'>
        <Col>
          <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> {text}
        </Col>
        {!screens.xs && <Col>
          <Text type="secondary" italic>{item.extra}</Text>
        </Col>}
      </Row>
    }
  ]

  const clientColumns = [
    {
      title: 'Client Portal',
      dataIndex: 'name',
      render: (text, item) => <Row justify='space-between'>
        <Col>
          <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> {text}
        </Col>
        {!screens.xs && <Col>
          <Text type="secondary" italic>{item.extra}</Text>
        </Col>}
      </Row>
    }
  ]

  return (
    <Container>
      <InnerContainer>
        <Title style={{ textAlign: 'center' }}>Included Main Features</Title>
        <Row justify='center' >
          <Col style={{ maxWidth: 700, width: '100%' }}>
            <Table
              columns={orgColumns}
              dataSource={orgFeatures}
              size="small"
              pagination={false}
              bordered={false}
            />
            <Table
              columns={clientColumns}
              dataSource={clientFeatures}
              size="small"
              pagination={false}
              bordered={false}
            />
          </Col>
        </Row>
      </InnerContainer>
    </Container>
  )
}

HomeFeatureListArea.propTypes = {
};

HomeFeatureListArea.defaultProps = {
};
