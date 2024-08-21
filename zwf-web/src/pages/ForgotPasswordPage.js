import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Input, Button, Form, Layout } from 'antd';
import { Logo } from 'components/Logo';
import { forgotPassword$ } from 'services/authService';
import { notify } from 'util/notify';
import { ForgotPasswordPanel } from './ForgotPasswordPanel';
import HomeFooter from 'components/HomeFooter';
const ContainerStyled = styled(Layout.Content)`
  padding: 3rem 1rem;
  margin: 0 auto;
  text-align: center;
  max-width: 400px;
`;

const LayoutStyled = styled(Layout)`
margin: 0 auto;
padding: 0;
background-color: #ffffff;
text-align: center;
min-height: 100%;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
const ForgotPasswordPage = props => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  }

  return <LayoutStyled>
    <ContainerStyled>
      <LogoContainer><Logo /></LogoContainer>
      <Title level={2}>Forgot Password</Title>
      <ForgotPasswordPanel onFinish={() => navigate('/')} />
      <Form.Item >
        <Button block type="link" onClick={() => goBack()}>Cancel</Button>
      </Form.Item>
    </ContainerStyled>
    <HomeFooter/>
  </LayoutStyled>;
}

ForgotPasswordPage.propTypes = {};

ForgotPasswordPage.defaultProps = {};

export default ForgotPasswordPage;
