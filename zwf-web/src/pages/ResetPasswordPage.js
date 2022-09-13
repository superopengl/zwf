import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Typography, Input, Button, Form, Divider, Layout } from 'antd';
import { Logo } from 'components/Logo';
import { resetPassword$ } from 'services/authService';
import { notify } from 'util/notify';
import { finalize } from 'rxjs/operators';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import HomeFooter from 'components/HomeFooter';

const LayoutStyled = styled(Layout)`
margin: 0 auto;
padding: 0;
background-color: #ffffff;
text-align: center;
min-height: 100%;
`;

const ContainerStyled = styled(Layout.Content)`
  padding: 3rem 1rem;
  text-align: center;
  max-width: 400px;
  margin: 0 auto;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
const ResetPasswordPage = props => {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const goBack = () => {
    navigate(-1);
  }

  const handleSubmit = values => {
    if (loading) {
      return;
    }

    setLoading(true);
    const { password } = values;
    const token = searchParams.get('token');
    const r = searchParams.get('r');

    resetPassword$(token, password)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(() => {
        notify.success('Successfully reset password');
        navigate('/login' + (r ? `?r=${encodeURIComponent(r)}` : ''));
      });
  }

  const validateConfirmPasswordRule = ({ getFieldValue }) => {
    return {
      async validator(value) {
        if (getFieldValue('password') !== getFieldValue('confirmPassword')) {
          throw new Error('The confirm password does not match');
        }
      }
    }
  }


  return <LayoutStyled>
    <ContainerStyled>
      <LogoContainer><Logo /></LogoContainer>
      <Title level={2}>Set Password</Title>
      <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left', minWidth: 300 }}>
        <Form.Item label="Password (at least 8 letters)" name="password" rules={[{ required: true, min: 8, message: ' ' }]}>
          <Input.Password placeholder="Password" maxLength="50" 
          autoComplete="new-password" disabled={loading} autoFocus={true} />
        </Form.Item>
        {/* <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, min: 8, message: ' ' }, validateConfirmPasswordRule]}>
          <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={loading} visibilityToggle={false} />
        </Form.Item> */}
        <Form.Item style={{ marginTop: '2rem' }}>
          <Button block type="primary" htmlType="submit" disabled={loading}>Set Password</Button>
        </Form.Item>
        {/* <Form.Item>
          <Button block type="link" onClick={() => goBack()}>Cancel</Button>
        </Form.Item> */}
      </Form>
      {/* <Divider /> */}
      <Link to="/"><Button block type="link">Go to home page</Button></Link>
    </ContainerStyled>
    <HomeFooter />
  </LayoutStyled>
}

ResetPasswordPage.propTypes = {};

ResetPasswordPage.defaultProps = {};

export default ResetPasswordPage;
