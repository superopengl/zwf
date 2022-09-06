import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Col, Row, Space, Button, Table } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { VscRocket } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import { subscriptionDef } from 'def/subscriptionDef';

const { Title, Paragraph, Text } = Typography;

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

const orgColumns = [
  {
    title: 'Org Portal',
    dataIndex: 'name',
    render: text => <Row justify='space-between'>
      <Col>
        <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> {text}
      </Col>
      <Col>
        <Text type="secondary" italic>included</Text>
      </Col>
    </Row>
  }
]

const orgFeatures = [
  'Status based task management',
  'Task assignment',
  'Scheduler to periodically create tasks',
  'Task template',
  'Doc template',
  'Realtime client communication',
  'Task event timeline',
  'Request client for actions',
  'Request client for Doc Sign',
  'Tags for task and user management',
  'Invite any clients by email addresses',
  'Google Single Sign On',
  'Team metrics',
].map(x => ({
  key: x,
  name: x,
}))

const clientColumns = [
  {
    title: 'Client Portal',
    dataIndex: 'name',
    render: text => <Row justify='space-between'>
      <Col>
        <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> {text}
      </Col>
      <Col>
        <Text type="secondary" italic>free</Text>
      </Col>
    </Row>
  }
]

const clientFeatures = [
  'Realtime chat communication',
  'Task event timeline',
  'Doc Sign',
].map(x => ({
  key: x,
  name: x,
}))

export const HomeFeaturesArea = props => {
  return (
    <Container>
      <InnerContainer>
        <Title style={{ textAlign: 'center' }}>Included Features</Title>
        <Row justify='center' >
          <Col style={{ maxWidth: 800, width: '100%' }}>
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

HomeFeaturesArea.propTypes = {
};

HomeFeaturesArea.defaultProps = {
};
