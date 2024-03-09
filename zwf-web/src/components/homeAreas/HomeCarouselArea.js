import React, { useContext } from 'react';
import styled from 'styled-components';
import { Typography, Button, Space, Row, Col } from 'antd';
import { withRouter } from 'react-router-dom';
import { useWindowWidth } from '@react-hook/window-size'
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { Logo } from 'components/Logo';

const { Title } = Typography;


const ContainerStyled = styled.div`
border-bottom: 1px solid #f0f0f0;
margin: 0 auto 0 auto;
// padding: 1rem;
width: 100%;
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
background-color: #37AFD2;
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
  color: rgba(255,255,255,1);
  text-align: center;
}

.poster-patterns {
background-image: url("images/logo.svg");
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

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

const HomeCarouselAreaRaw = props => {

  const windowWidth = useWindowWidth();
  const context = useContext(GlobalContext);

  const isGuest = context.role === 'guest';

  const posterHeight = windowWidth < 576 ? 400 :
    windowWidth < 992 ? 450 :
      500;

  const catchPhraseSize = windowWidth < 576 ? 28 :
    windowWidth < 992 ? 36 :
      44;

  const handleSignIn = () => {
    props.history.push('/signup')
  }

  return (
    <ContainerStyled gutter={0} style={{ position: 'relative' }}>
      <PosterContainer style={{ height: posterHeight, position: 'relative' }}>
        <div className="poster-patterns" />
        <Space direction="vertical" style={{ maxWidth: '1200px', textAlign: 'center' }}>
          <Space size="large">
            <Logo />
            <Title style={{ fontSize: catchPhraseSize, color: '#ffc53d' }} >ZeeWorkflow</Title>
          </Space>
          <Title level={2} style={{ marginTop: 0, fontWeight: 300, fontSize: Math.max(catchPhraseSize * 0.5, 14) }}>
            All in one system for file, doc, job, task and workflow management. Come on, join us today!!
              </Title>
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
        </Space>
      </PosterContainer>
    </ContainerStyled>
  );
}

HomeCarouselAreaRaw.propTypes = {};

HomeCarouselAreaRaw.defaultProps = {};

export const HomeCarouselArea = withRouter(HomeCarouselAreaRaw);

export default HomeCarouselArea;
