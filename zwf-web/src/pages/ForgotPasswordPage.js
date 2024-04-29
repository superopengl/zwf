import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Input, Button, Form, Layout } from 'antd';
import { Logo } from 'components/Logo';
import { forgotPassword$ } from 'services/authService';
import { notify } from 'util/notify';
import { ForgotPasswordPanel } from './ForgotPasswordPanel';
const ContainerStyled = styled.div`
  margin: 2rem auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
const ForgotPasswordPage = props => {
  const navigate = useNavigate();

  const goBack = () => {
    history.goBack();
  }

  return <LayoutStyled>
    <ContainerStyled>
      <LogoContainer><Logo /></LogoContainer>
      <Title level={2}>Forgot Password</Title>
      <ForgotPasswordPanel onFinish={() => history.push('/')} />
      <Form.Item >
        <Button block type="link" onClick={() => goBack()}>Cancel</Button>
      </Form.Item>
      <Form.Item>
        <Link to="/"><Button block type="link">Go to home page</Button></Link>
      </Form.Item>
    </ContainerStyled>
  </LayoutStyled>;
}

ForgotPasswordPage.propTypes = {};

ForgotPasswordPage.defaultProps = {};

export default ForgotPasswordPage;
