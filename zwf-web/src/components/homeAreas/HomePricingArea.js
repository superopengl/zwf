import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Col, Row, Space, Button } from 'antd';
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
`;

const InnerContainer = styled.div`
width: 100%;
background-color:  #F1F2F5;
padding-top: 3rem;
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



export const HomePricingArea = props => {
  return (
    <Container>
      <InnerContainer>
        <Title style={{ color: '#0FBFC4', textAlign: 'center', fontWeight: 700, fontSize: 18, lineHeight: 1.5, margin: 0 }}>Only One Plan !</Title>
        <Title style={{ textAlign: 'center', fontWeight: 800, fontSize: 36, lineHeight: 1, margin: 0 }}>We get tired of multiple plans</Title>
        <Row>
          <Col flex="auto"></Col>
          <Col flex="none" style={{ position: 'relative', top: 48 }}>
            <div className='price-card'>
              <Space direction='vertical' style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#0FBFC4', fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>ALL IN ONE PLAN</Text>
                <div><Text style={{ color: '#ffffff', fontSize: 36, fontWeight: 800 }}>$39.0</Text><Text style={{ color: '#97A3B7' }}> <small>/Month</small></Text></div>
              </Space>
              <Paragraph style={{ fontSize: 16, marginTop: '1rem' }}>
                Description description description description description description description description description description description description description description
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> All the features we have
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> 15 days free trial
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> Monthly auto renew payment
              </Paragraph>
              <Button type="primary" size="large" block style={{ margin: '1rem 0 0' }}>Join Now</Button>
            </div>
          </Col>
          <Col flex="auto"></Col>
        </Row>
      </InnerContainer>
    </Container>
  )
}

HomePricingArea.propTypes = {
};

HomePricingArea.defaultProps = {
};
