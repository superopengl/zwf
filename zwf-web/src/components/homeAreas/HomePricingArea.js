import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Col, Row, Space, Button, Image, Grid } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { VscRocket } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import { subscriptionDef } from 'def/subscriptionDef';
import { OrgRegisterModal, useOrgRegisterModal } from 'hooks/useOrgRegisterModal';

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
background-color:  #F6F7F9;
// background-image: linear-gradient(5deg, #F1F2F5, #F1F2F5 50%, #ffffff 50%, #ffffff 100%);
padding: 6rem 1rem 0;
.price-card {
  max-width: 400px;
  width: calc(100vw - 2rem);
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
  const screens = Grid.useBreakpoint();
  const [openModal, contextHolder] = useOrgRegisterModal();

  const handleShowModal = (e) => {
    openModal();
  }

  return (
    <Container>
      <InnerContainer justify='center'>
        <Title style={{ color: '#0FBFC4', textAlign: 'center', fontWeight: 700, fontSize: 18, lineHeight: 2, margin: 0 }}>We get tired of multiple plans!</Title>
        <Title style={{ textAlign: 'center', fontWeight: 800, margin: 0 }}>Hassle-Free with <span style={{ color: '#0FBFC4' }}>Just one plan</span></Title>
        <Row justify='center'
          style={{
            backgroundImage: screens.xs ? 'none' : 'url("/images/pricing-section-background.svg")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom',
            margin: '0 -1rem',
          }}
        >
          <Col
            style={{ position: 'relative', top: 80, display: 'flex', justifyContent: 'center', minWidth: 360 }}
          >
            <div className='price-card'>
              <Row justify="space-between" align="middle">
                <Col span={12}><Text style={{ color: '#0FBFC4', fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>ALL IN ONE PLAN</Text></Col>
                <Col><Text style={{ color: '#ffffff', fontSize: 40, lineHeight: 1.4, fontWeight: 800 }}>$49.0</Text></Col>
                <Col>
                  <small>/Month</small><br />
                  <small>Incl GST</small>
                </Col>
              </Row>
              <Paragraph style={{ fontSize: 14, opacity: 0.8, marginTop: '1rem' }}>
              You have access to all past and future functions ZeeWorkflow provides - we believe in providing complete access to everything we offer. We understand the frustration of complicated pricing plans, which is why we offer a simple pricing structure with only one option available.
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> 14 days free trial
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> Monthly auto renew after trial
              </Paragraph>              
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> GST included
              </Paragraph>              
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> All the features included
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> Coming-up features always included
              </Paragraph>
              <Paragraph>
                <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> No long term contract bound
              </Paragraph>          
              <Button type="primary" size="large" block style={{ margin: '1rem 0 0' }} onClick={handleShowModal} ><strong>Join Now</strong></Button>
            </div>
          </Col>
        </Row>
        {contextHolder}
      </InnerContainer>
    </Container>
  )
}

HomePricingArea.propTypes = {
};

HomePricingArea.defaultProps = {
};
