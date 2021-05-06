import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Layout } from 'antd';
import { Logo } from 'components/Logo';
import { forgotPassword$ } from 'services/authService';
import { notify } from 'util/notify';
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
  const [loading, setLoading] = React.useState(false);


  const goBack = () => {
    props.history.goBack();
  }

  const handleSubmit = async values => {
    if (loading) {
      return;
    }

    setLoading(true);

    const { email } = values;

    forgotPassword$(email).subscribe(
      () => {
        notify.success(
          'Successfully sent out email',
          <>An email with the reset password link was sent out to your registration email <strong>{email}</strong></>
        );
        props.history.push('/')
      },
      err => setLoading(false)
    );
  }

  return <LayoutStyled>
    <ContainerStyled>
      <LogoContainer><Logo /></LogoContainer>
      <Title level={2}>Forgot Password</Title>
      <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
        <Form.Item label="Registration email" name="email" rules={[{ required: true, whitespace: true, max: 100, type: 'email', message: 'Please input valid email address' }]}>
          <Input placeholder="abc@xyz.com" type="email" allowClear={true} maxLength="100" disabled={loading} autoFocus={true} />
        </Form.Item>
        <Form.Item style={{ marginTop: '2rem' }}>
          <Button block type="primary" htmlType="submit" disabled={loading}>Send reset link to email</Button>
        </Form.Item>
        <Form.Item >
          <Button block type="link" onClick={() => goBack()}>Cancel</Button>
        </Form.Item>
        <Form.Item>
          <Link to="/"><Button block type="link">Go to home page</Button></Link>
        </Form.Item>
      </Form>
    </ContainerStyled>
  </LayoutStyled>;
}

ForgotPasswordPage.propTypes = {};

ForgotPasswordPage.defaultProps = {};

export default withRouter(ForgotPasswordPage);
