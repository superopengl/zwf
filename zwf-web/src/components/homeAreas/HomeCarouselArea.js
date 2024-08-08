import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col, Image, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useWindowWidth } from '@react-hook/window-size'
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { Logo } from 'components/Logo';
import { InputYear } from 'components/InputYear';
import { OrgRegisterInput } from 'components/OrgRegisterInput';


const { Title, Text, Paragraph } = Typography;


const ContainerStyled = styled.div`
// border-bottom: 1px solid #f0f0f0;
margin: 0 auto 0 auto;
// padding: 1rem;
width: 100%;
background-color: #ffffff;
`;

const SignInButton = styled(Button)`
margin-top: 1rem;
max-width: 300px;
height: 50px;
border-radius: 30px;
// font-size: 1.3rem;
border: 2px solid white;
`;


const PosterContainer = styled.div`
// background-repeat: no-repeat;
// background-size: cover;
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

.poster-patterns {
background-image: url("images/logo-tile.png");
  background-repeat: repeat;
  background-size: 120px;
  opacity: 0.1;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
}



`;

const CatchPicture = styled.div`
min-width: 250px;
min-height: 250px;
// background-image: linear-gradient(135deg, #37AFD2, #37AFD2 25%, #5cdbd3 25%, #5cdbd3 50%, #87e8de 50%, #87e8de 75%, #b5f5ec 75%, #b5f5ec 100%);
background: radial-gradient(closest-side, transparent 0%, white 100%), 
                 linear-gradient(45deg, #b5f5ec, #37AFD2 100%);
padding: 80px;
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

export const HomeCarouselArea = props => {

  const windowWidth = useWindowWidth();
  const navigate = useNavigate();
  const context = useContext(GlobalContext);

  const isGuest = context.role === 'guest';

  const posterHeight = windowWidth < 576 ? 400 :
    windowWidth < 992 ? 450 :
      500;

  const catchPhraseSize = windowWidth < 576 ? 28 :
    windowWidth < 992 ? 36 :
      44;

  const handleSignIn = () => {
    navigate('/signup')
  }

  return (
    <ContainerStyled gutter={0} style={{ position: 'relative' }}>
      <PosterContainer style={{ height: posterHeight, position: 'relative' }}>
        {/* <div className="poster-patterns" /> */}
        <Row justify="center" align="middle" gutter={[40, 40]}>
          <Col {...span}>
            <Space direction="vertical" style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Title style={{fontWeight: 'bold'}}>
                <Text style={{ color: '#0FBFC4' }}>All in one system</Text> for file, doc, job, task, e-sign, CMS, and workflow management.
              </Title>
              <Paragraph>
                All in one system for file, doc, job, task and workflow management. Come on, join us today!!
              </Paragraph>
              <OrgRegisterInput />
            </Space>
          </Col>
          <Col {...span}>
            <CatchPicture>
              <div style={{padding: 10, position: 'relative'}}>
                <div style={{backgroundColor: '#0FBFC4', width: 150, height: 150, borderRadius: 8, position: 'absolute', left:0, bottom : 0}}></div>
                <div style={{backgroundColor: '#FF7D00', width: 150, height: 150, borderRadius: 8, position: 'absolute', right:0, top : 0}}></div>
                <Image src="/images/catchPicture.png" />
              </div>
            </CatchPicture>
          </Col>
        </Row>
        {/* {isGuest &&
            <Row style={{ maxWidth: 500, margin: '0 auto' }} gutter={30}>
              <Col {...span}>
                <SignInButton block type="primary"
                  size="large"
                  onClick={() => handleSignIn()}>Join</SignInButton>
              </Col>
              <Col {...span}>
                <GoogleSsoButton
                  render={
                    renderProps => (
                      <SignInButton
                        block
                        type="secondary"
                        size="large"
                        icon={<GoogleLogoSvg />}
                        onClick={renderProps.onClick}
                        disabled={renderProps.disabled}
                        style={{ paddingTop: 6 }}
                      >Continue with Google</SignInButton>
                    )}
                />
              </Col>
            </Row>} */}
      </PosterContainer>
    </ContainerStyled>
  );
}

HomeCarouselArea.propTypes = {};

HomeCarouselArea.defaultProps = {};


