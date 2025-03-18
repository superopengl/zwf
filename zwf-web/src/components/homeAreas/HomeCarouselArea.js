import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col, Image } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useWindowWidth } from '@react-hook/window-size'
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
// background-image: url("images/logo-primary.svg");
// background-repeat: repeat;
// background-color: #0FBFC4;
// background-size: 120px;
// opacity: 0.75;
// background-image: linear-gradient(135deg, #0FBFC4, #0FBFC4 25%, #5cdbd3 25%, #5cdbd3 50%, #87e8de 50%, #87e8de 75%, #b5f5ec 75%, #b5f5ec 100%);
width: 100%;
min-height: 200px;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 1rem;
// padding-top: 40px;
// display: block;


.light2 {
  position: absolute;
  width: clamp(100px, 50vw, 470px);
  height: clamp(50px, 50vw, 200px);
  left: clamp(50px, 60vw, 120px);
  top: clamp(20px, 20vw, 200px);
  // border: 1px solid red;
  
  background: linear-gradient(268.24deg, rgba(0, 61, 182, 0.5) 12.79%, rgba(55, 212, 207, 0.5) 56.4%);
  filter: blur(clamp(80px, 20vw, 120px));
  transform: rotate(-31.89deg);
}

.light1 {
  position: absolute;
  width: clamp(30px, 80vw, 260px);
  height: clamp(10px, 80vw, 140px);
  left: clamp(50px, 60vw, 480px);
  top: clamp(0px, 20vw, 200px);
  // border: 1px solid blue;
  
  background: rgba(0, 61, 182, 0.8);
  filter: blur(clamp(200px, 20vw, 300px));
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
        <Row justify="center" align="middle" gutter={[64, 32]}>
          <Col
          // style={{padding: '0 32px'}}
          >
            <Space direction="vertical" style={{ maxWidth: 500, margin: '40px auto' }}>
              <Title style={{ fontSize: 'clamp(28px, 3vw, 36px)', fontWeight: 800 }}>
                <span style={{ color: '#0FBFC4' }}>All in one system</span> for file, doc, job, task, e-sign, CMS, and workflow management.
              </Title>
              <Paragraph>
                Join today to experience a comprehensive management system for files, documents, jobs, tasks, and workflows, all in one place!
              </Paragraph>
              <OrgRegisterInput />
            </Space>
          </Col>
          <Col
            style={{ position: 'relative' }}
          >
            <div className="light1"></div>
            <div className="light2"></div>
            <Image src="/images/landingpage-image.svg" width="100%" preview={false} />
            <Image src="/images/landingpage-view.png" width="110%" preview={false} style={{ position: 'absolute', left: '-9%', bottom: '7%' }} />
            <Image src="/images/landingpage-flyman.svg" width="50%" preview={false} style={{ position: 'absolute', left: '-10%', bottom: '-15%' }} />
          </Col>
        </Row>
      </PosterContainer>
    </ContainerStyled>
  );
}

HomeCarouselArea.propTypes = {};

HomeCarouselArea.defaultProps = {};


