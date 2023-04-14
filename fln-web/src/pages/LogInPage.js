import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Layout, Divider } from 'antd';
import { Logo } from 'components/Logo';
import isEmail from 'validator/es/lib/isEmail';
import { GlobalContext } from '../contexts/GlobalContext';
import { login, login$ } from 'services/authService';
import { countUnreadMessage } from 'services/messageService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';

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
  const [sending, setLoading] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { setUser, setNotifyCount } = context;


  const validateName = async (rule, value) => {
    const isValid = value && isEmail(value);
    if (!isValid) {
      throw new Error();
    }
  }

  const handleSubmit = async values => {
    if (sending) {
      return;
    }

    try {
      setLoading(true);

      const user = await login(values.name, values.password);
      setUser(user);

      const count = await countUnreadMessage();
      setNotifyCount(count);

      props.history.push('/dashboard');
    } catch {
      setLoading(false);
    }
  }

  return (
    <LayoutStyled>
      <ContainerStyled>
        <LogoContainer><Logo /></LogoContainer>
        <Title level={3}>Log In</Title>
        <GoogleSsoButton
          render={
            renderProps => (
              <Button
                ghost
                type="primary"
                block
                icon={<GoogleLogoSvg size={16} />}
                // icon={<GoogleOutlined />}
                style={{ marginTop: '1.5rem' }}
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              >Continue with Google</Button>
            )}
        />
        <Divider>or</Divider>
        <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
          <Form.Item label="Email" name="name"
            rules={[{ required: true, validator: validateName, whitespace: true, max: 100, message: 'Please input valid email address' }]}
          >
            <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" disabled={sending} autoFocus={true} />
          </Form.Item>
          <Form.Item label="Password" name="password" autoComplete="current-password" rules={[{ required: true, message: 'Please input password' }]}>
            <Input.Password placeholder="Password" autoComplete="current-password" maxLength="50" disabled={sending} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={sending}>Log In</Button>
          </Form.Item>

          {/* <Form.Item>
            <Link to="/signup"><Button ghost block type="primary">Sign Up</Button></Link>
          </Form.Item> */}
          <Form.Item>
            <Link to="/forgot_password">
              <Button block type="link">Forgot password? Click here to reset</Button>
            </Link>
            {/* <Link to="/"><Button block type="link">Go to home page</Button></Link> */}
        <Link to="/signup"><Button size="small" block type="link">Not a user? Click to sign up</Button></Link>
          </Form.Item>
        </Form>
      </ContainerStyled>
    </LayoutStyled>
  );
}

LogInPage.propTypes = {};

LogInPage.defaultProps = {};

export default withRouter(LogInPage);
