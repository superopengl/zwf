import React from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Typography, Input, Button, Form, Divider, Layout, Row, Col } from 'antd';
import { Logo } from 'components/Logo';
import { resetPassword$ } from 'services/authService';
import { notify } from 'util/notify';
import { finalize } from 'rxjs/operators';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import HomeFooter from 'components/HomeFooter';
import { useAuthUser } from 'hooks/useAuthUser';
import { GoogleSsoButton } from 'components/GoogleSsoButton';
import { GoogleLogoSvg } from 'components/GoogleLogoSvg';
import Icon from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';
import { useAssertRole } from 'hooks/useAssertRole';

const { Paragraph } = Typography;

const LayoutStyled = styled(Layout)`
margin: 0 auto;
padding: 0;
background-color: #ffffff;
min-height: 100%;
`;

const ContainerStyled = styled(Layout.Content)`
  padding: 3rem 1rem;
  max-width: 460px;
  margin: 0 auto;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const { Title } = Typography;
const ActivateAccountPage = props => {
  useAssertRole(['guest']);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setAuthUser] = useAuthUser();

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
      .subscribe(user => {
        setAuthUser(user);
        notify.success('Successfully set password');
        // navigate('/login' + (r ? `?r=${encodeURIComponent(r)}` : ''));
        navigate('/task');
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
      <Row justify="center" style={{ textAlign: 'center', flexDirection: 'column' }}>
        <Logo />
        <Title level={2}>Activate Account</Title>
      </Row>
      <ProCard gutter={[20, 20]} direction="row" split='horizontal' bordered>
        <ProCard title="Google SSO">
          <Paragraph>
            I received the invitation using a Google account and I would like to proceed with single sign-on (SSO)
          </Paragraph>
          {/* <Divider /> */}
          <GoogleSsoButton
            type="login"
            onStart={() => setLoading(true)}
            onEnd={() => setLoading(false)}
            render={
              renderProps => (
                <Button
                  block
                  // type="secondary"
                  size="large"
                  icon={<Icon component={GoogleLogoSvg} />}
                  // icon={<GoogleOutlined />}
                  style={{ marginTop: '1.5rem' }}
                  onClick={() => {
                    setLoading(true);
                    renderProps.onClick()
                  }}
                  disabled={renderProps.disabled}
                >Continue with Google</Button>
              )}
          />
        </ProCard>
        <ProCard title="Local account">
          <Paragraph>
            Using email and password to log in, please ensure that you have set a password. If you have a Google account associated with your email address, we recommend using above Google SSO.
          </Paragraph>
          <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }}>
            <Form.Item label="Password (at least 8 letters)" name="password" rules={[{ required: true, min: 8, message: ' ' }]}>
              <Input.Password placeholder="Password" maxLength="50"
                autoComplete="new-password" disabled={loading} autoFocus={true} />
            </Form.Item>
            {/* <Form.Item label="Confirm Password" name="confirmPassword" rules={[{ required: true, min: 8, message: ' ' }, validateConfirmPasswordRule]}>
          <Input.Password placeholder="Password" maxLength="50" autoComplete="new-password" disabled={loading} visibilityToggle={false} />
        </Form.Item> */}
            <Form.Item style={{ marginTop: '2rem' }}>
              <Button block type="primary" htmlType="submit" disabled={loading}>Activate Account</Button>
            </Form.Item>
            {/* <Form.Item>
          <Button block type="link" onClick={() => goBack()}>Cancel</Button>
        </Form.Item> */}
          </Form>
        </ProCard>

        {/* <Link to="/"><Button block type="link">Go to home page</Button></Link> */}

      </ProCard>

    </ContainerStyled>
    <HomeFooter />
  </LayoutStyled>
}

ActivateAccountPage.propTypes = {};

ActivateAccountPage.defaultProps = {};

export default ActivateAccountPage;
