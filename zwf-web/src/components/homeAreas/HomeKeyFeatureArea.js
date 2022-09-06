import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Col, Row, Space, Button, Table, Image } from 'antd';
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
max-width: 800px;
// background-color:  #F1F2F5;
// background-image: linear-gradient(5deg, #F1F2F5, #F1F2F5 50%, #ffffff 50%, #ffffff 100%);
padding: 3rem 1rem 1rem;
margin: 0 auto;

h2 {
  font-size:24px;
  font-weight:700;
}

.ant-row {
  margin: 1rem auto;
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

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

export const HomeKeyFeatureArea = props => {
  return (
    <Container>
      <InnerContainer>
        <Title style={{ textAlign: 'center' }}>Key Features</Title>
        <Row gutter={[48, 24]} justify='center'>
          <Col {...span} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            <Title level={2}><Text style={{ color: '#0FBFC4' }}>Task</Text> Template</Title>
            <Paragraph>Task management description. Task management description. Task management description. Task management description. </Paragraph>
          </Col>
          <Col {...span} style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/images/feature-task-template.svg" preview={false} />
          </Col>
        </Row>
        <Row gutter={[48, 24]} justify='center'>
          <Col {...span} style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/images/feature-doc-template.svg" preview={false} />
          </Col>
          <Col {...span} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            <Title level={2}><Text style={{ color: '#0051D9' }}>Doc</Text> Template</Title>
            <Paragraph>Task management description. Task management description. Task management description. Task management description. </Paragraph>
          </Col>
        </Row>
        <Row gutter={[48, 24]} justify='center'>
          <Col {...span} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
            <Title level={2}>Doc <Text style={{ color: '#F77234' }}>Sign</Text></Title>
            <Paragraph>Task management description. Task management description. Task management description. Task management description. </Paragraph>
          </Col>
          <Col {...span} style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/images/feature-doc-sign.svg" preview={false} />
          </Col>
        </Row>
        <Row gutter={[24, 24]} justify='center'>
          <Col span={24} style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
            <Title level={2}>Task management</Title>
            <Paragraph>Task management description. Task management description. Task management description. Task management description. </Paragraph>
          </Col>
          <Col span={24} style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src="/images/feature-task-management.svg" preview={false} />
          </Col>
        </Row>
      </InnerContainer>
    </Container>
  )
}

HomeKeyFeatureArea.propTypes = {
};

HomeKeyFeatureArea.defaultProps = {
};
