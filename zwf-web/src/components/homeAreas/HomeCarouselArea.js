import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useWindowWidth } from '@react-hook/window-size'
import { GlobalContext } from 'contexts/GlobalContext';
import { OrgRegisterInput } from 'components/OrgRegisterInput';


const { Title, Text, Paragraph } = Typography;


const ContainerStyled = styled.div`
// border-bottom: 1px solid #f0f0f0;
margin: 0 auto 0 auto;
// padding: 1rem;
width: 100%;
// background-color: #ffffff;
`;



const PosterContainer = styled.div`
// background-repeat: no-repeat;
// background-size: cover;
margin-top: 3rem;
position: relative;
// background-position: center;
// background-image: url("images/logo.svg");
// background-repeat: repeat;
// background-color: #37AFD2;
// background-size: 120px;
// opacity: 0.75;
// background-image: linear-gradient(135deg, #37AFD2, #37AFD2 25%, #5cdbd3 25%, #5cdbd3 50%, #87e8de 50%, #87e8de 75%, #b5f5ec 75%, #b5f5ec 100%);
width: 100%;
min-height: 200px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 1rem;
// padding-top: 40px;
// display: block;

.ant-typography {
  // color: rgba(255,255,255,1);
  text-align: center;
}

.light2 {
  position: absolute;
  width: 473.17px;
  height: 206.99px;
  left: 122.65px;
  top: 205.57px;
  
  background: linear-gradient(268.24deg, rgba(0, 61, 182, 0.4) 12.79%, rgba(55, 212, 207, 0.4) 56.4%);
  filter: blur(219.522px);
  transform: rotate(-31.89deg);
  
}

.light1 {
  position: absolute;
  width: 252.99px;
  height: 142.02px;
  left: 481.69px;
  top: 198.94px;
  
  background: rgba(0, 61, 182, 0.8);
  filter: blur(355.502px);
  transform: rotate(-135deg);
}
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 24,
  xl: 12,
  xxl: 12
}

export const HomeCarouselArea = () => {

  return (
    <ContainerStyled gutter={0} style={{ position: 'relative' }}>
      <PosterContainer style={{ position: 'relative' }}>
        {/* <div className="poster-patterns" /> */}
        <Row justify="center" align="middle" gutter={[0, 32]}>
          <Col {...span}>
            <Space direction="vertical" style={{ justifyContent: 'center', alignItems: 'center', width: '100%', margin: '40px auto' }}>
              <Title style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800 }}>
                <Text style={{ color: '#0FBFC4' }}>All in one system</Text> for file, doc, job, task, e-sign, CMS, and workflow management.
              </Title>
              <Paragraph>
                All in one system for file, doc, job, task and workflow management. Come on, join us today!!
              </Paragraph>
              <OrgRegisterInput />
            </Space>
          </Col>
          <Col {...span} style={{ position: 'relative', paddingRight: 32 }}>
            <div className="light1"></div>
            <div className="light2"></div>
            <Image src="/images/landingpage-image.svg" width="100%" preview={false} />
          </Col>
        </Row>
      </PosterContainer>
    </ContainerStyled>
  );
}

HomeCarouselArea.propTypes = {};

HomeCarouselArea.defaultProps = {};


