import React from 'react';
import PropTypes from 'prop-types';
import { Card, Typography, Col, Row, Space, Button, Image } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { SubscriptionCard } from 'components/SubscriptionCard';
import { GiCurvyKnife, GiFireAxe, GiSawedOffShotgun, GiPirateCannon } from 'react-icons/gi';
import { VscRocket } from 'react-icons/vsc';
import { AiOutlineHome } from 'react-icons/ai';
import { subscriptionDef } from 'def/subscriptionDef';
import { OrgRegisterModal } from 'components/OrgRegisterModal';

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
padding-top: 6rem;
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
  const [visible, setVisible] = React.useState(false);


  const handleShowModal = (e) => {
    e.stopPropagation();
    setVisible(true);
  }

  const handleHideModal = () => {
    setVisible(false);
  }

  return (
    <Container>
      <InnerContainer justify='center'>
        <Title style={{ color: '#0FBFC4', textAlign: 'center', fontWeight: 700, fontSize: 18, lineHeight: 2, margin: 0 }}>We get tired of multiple plans!</Title>
        <Title style={{ textAlign: 'center', fontWeight: 800, margin: 0 }}>Hassle-Free with <Text style={{ color: '#0FBFC4' }}>Just one plan</Text></Title>
        <Row justify='center'>
          <Row align='end'
            justify='center'
            gutter={20}
            wrap={false}
            style={{ alignItems: 'flex-end' }}
          >
            <Col flex="auto" style={{ textAlign: 'right', width: 400 }}
            >
              <Image src="/images/price-card-left.svg" preview={false} />
            </Col>
            <Col
              style={{ position: 'relative', top: 48, display: 'flex', justifyContent: 'center', minWidth: 360 }}
            >
              <div className='price-card'>
                <Space direction='horizontal' align="end" style={{ width: '100%', justifyContent: 'center'}}>
                  <Text style={{ color: '#0FBFC4', fontSize: 28, lineHeight: 1.2, fontWeight: 800 }}>ALL IN ONE PLAN</Text>
                  <Space><Text style={{ color: '#ffffff', fontSize: 36, fontWeight: 800 }}>$39.0</Text><Text style={{ color: '#97A3B7' }}> <small>/Month</small></Text></Space>
                </Space>
                <Paragraph style={{ fontSize: 16, marginTop: '1rem' }}>
                  Description description description description description description description description description description description description description description
                </Paragraph>
                <Paragraph>
                  <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> 14 days free trial
                </Paragraph>
                <Paragraph>
                  <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> All the features included
                </Paragraph>
                <Paragraph>
                  <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> Coming-up features always included
                </Paragraph>
                <Paragraph>
                  <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> Monthly auto renew payment
                </Paragraph>
                <Paragraph>
                  <CheckCircleOutlined style={{ color: '#009A29', marginRight: '1rem' }} /> No long term contract bound
                </Paragraph>                
                <Button type="primary" size="large" block style={{ margin: '1rem 0 0' }} onClick={handleShowModal} >Join Now</Button>
              </div>
            </Col>
            <Col flex="auto"
              style={{ textAlign: 'left',width: 400 }}
            >
              <Image src="/images/price-card-right.svg" preview={false} />

            </Col>
          </Row>
        </Row>
        <OrgRegisterModal
          visible={visible}
          onOk={handleHideModal}
          onCancel={handleHideModal}
        />
      </InnerContainer>
    </Container>
  )
}

HomePricingArea.propTypes = {
};

HomePricingArea.defaultProps = {
};
