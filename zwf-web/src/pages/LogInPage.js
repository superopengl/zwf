import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Typography, Button, Form, Layout, Divider, Image } from 'antd';
import { Logo } from 'components/Logo';
import { LogInPanel } from './LogInPanel';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { GoogleSsoButton } from 'components/GoogleSsoButton';
import { GoogleLogoSvg } from 'components/GoogleLogoSvg';
import Icon from '@ant-design/icons';
import HomeFooter from 'components/HomeFooter';


const LayoutStyled = styled(Layout)`
margin: 0 auto;
padding: 0;
background-color: #ffffff;
text-align: center;
min-height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 1rem auto;
  padding: 2rem 3rem;
  text-align: center;
  max-width: 460px;
  // background-color: #ffffff;
  border: 1px solid #E3E6EB;
  border-radius: 8px;

`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
const LogInPage = props => {

  useDocumentTitle('User login');

  return (
    <LayoutStyled>
      <Layout.Content style={{padding: '3rem 1rem'}}>
        <LogoContainer><Logo /></LogoContainer>
        <Title level={3}>Login</Title>
      <ContainerStyled>
        <LogInPanel />
        <Form.Item>
          <Link to="/forgot_password">
            <Button block type="link">Forgot password</Button>
          </Link>
          {/* <Link to="/"><Button block type="link">Go to home page</Button></Link> */}
          <Link to="/signup"><Button block type="link">Not a user? Sign up now!</Button></Link>
        </Form.Item>
        <Divider>or</Divider>
          <GoogleSsoButton
            type="login"
            render={
              renderProps => (
                <Button
                  block
                  type="secondary"
                  size="large"
                  icon={<Icon component={GoogleLogoSvg} />}
                  // icon={<GoogleOutlined />}
                  style={{ marginTop: '1.5rem' }}
                  onClick={renderProps.onClick}
                  disabled={renderProps.disabled}
                >Continue with Google</Button>
              )}
          />
      </ContainerStyled>
      </Layout.Content>
      <HomeFooter />
    </LayoutStyled>
  );
}

LogInPage.propTypes = {};

LogInPage.defaultProps = {};

export default LogInPage;
