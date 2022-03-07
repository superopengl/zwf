import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Form, Layout } from 'antd';
import { Logo } from 'components/Logo';
import { LogInPanel } from './LogInPanel';

const LayoutStyled = styled(Layout)`
margin: 0 auto 0 auto;
background-color: #ffffff;
height: 100%;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 360px;
  background-color: #ffffff;
  height: 100%;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
const LogInPage = props => {
  return (
    <LayoutStyled>
      <ContainerStyled>
        <LogoContainer><Logo /></LogoContainer>
        <Title level={3}>Log In</Title>
        <LogInPanel />
        <Form.Item>
            <Link to="/forgot_password">
              <Button block type="link">Forgot password</Button>
            </Link>
            {/* <Link to="/"><Button block type="link">Go to home page</Button></Link> */}
            <Link to="/signup"><Button block type="link">Not a user? Sign up now!</Button></Link>
          </Form.Item>
      </ContainerStyled>
    </LayoutStyled>
  );
}

LogInPage.propTypes = {};

LogInPage.defaultProps = {};

export default withRouter(LogInPage);
