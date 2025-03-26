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
background-color: #F6F7F9;
`;

const InnerContainer = styled.div`
width: 100%;
max-width: 800px;
margin: 0 auto;
// background-color:  #F1F2F5;
// background-image: linear-gradient(5deg, #F1F2F5, #F1F2F5 50%, #ffffff 50%, #ffffff 100%);
padding: 3rem 1rem 1rem;
.ant-typography:not(h1) {
  font-size: 18px;
}
`;


export const HomeWhyUsArea = props => {
  return (
    <Container>
      <div justify='center' style={{ width: '100%', height: 'clamp(3rem, 7vw, 8rem)', backgroundImage: 'linear-gradient(to top left, #F6F7F9, #F6F7F9 50%, #ffffff 50%, #ffffff 100%)' }} />

      <InnerContainer>
        <Title style={{ textAlign: 'center' }}>Why <span style={{ color: '#F77234' }}>Us</span>?</Title>
        <Paragraph>
          Professional work requires thorough planning and action to ensure efficiency and organization, leading to increased profitability for your firm. ZeeWorkflow provides valuable insights into your staff's time, budget, and the status of client tasks, enabling you to implement consistent processes and achieve exponential growth. 
          </Paragraph>
        <Paragraph>
          Collaborate seamlessly with your clients through a centralized portal for file sharing, communication, and e-signatures. Automated correspondence reminders through messages and emails prompt clients to submit necessary files, improving workflow efficiency. With our seamless workflow, you can easily monitor your team's progress and track time spent on each client.
        </Paragraph>
        <Paragraph>
          Join us for a demo and experience the future of streamlined and profitable professional work.
        </Paragraph>
      </InnerContainer>
      <div justify='center' style={{ width: '100%', height: 'clamp(3rem, 7vw, 8rem)', backgroundImage: 'linear-gradient(to bottom left, #F6F7F9, #F6F7F9 50%, #ffffff 50%, #ffffff 100%)' }} />
    </Container>
  )
}

