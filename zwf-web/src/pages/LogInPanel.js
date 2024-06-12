import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button, Form, Divider } from 'antd';
import isEmail from 'validator/es/lib/isEmail';
import { GlobalContext } from '../contexts/GlobalContext';
import { login$ } from 'services/authService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { zip, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { getMyOrgProfile$ } from 'services/orgService';
import PropTypes from 'prop-types';


export const LogInPanel = props => {
  const { email } = props;

  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('r');

  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const context = React.useContext(GlobalContext);
  const { setUser } = context;

  const validateName = async (rule, value) => {
    const isValid = value && isEmail(value);
    if (!isValid) {
      throw new Error();
    }
  }

  const handleSubmit = values => {
    if (loading) {
      return;
    }

    setLoading(true);

    login$(values.name, values.password)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(
        (user) => {
          if (user) {
            setUser(user);

            if (user.role === 'system') {
              navigate(returnUrl || '/support')
            } else {
              const isAdminFirstLogin = user.role === 'admin' && !user.orgId;
              navigate(isAdminFirstLogin ? '/onboard' : (returnUrl || '/task'));
            }
          }
        },
      )
  }

  return (
    <>
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
      <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }} initialValues={email ? { name: email } : null}>
        <Form.Item label="Email" name="name"
          rules={[{ required: true, validator: validateName, whitespace: true, max: 100, message: 'Please input valid email address' }]}
        >
          <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" disabled={loading || !!email} autoFocus={true} />
        </Form.Item>
        <Form.Item label="Password" name="password" autoComplete="current-password" rules={[{ required: true, message: 'Please input password' }]}>
          <Input.Password placeholder="Password" autoComplete="current-password" maxLength="50" disabled={loading} />
        </Form.Item>
        <Form.Item>
          <Button block type="primary" htmlType="submit" disabled={loading}>Login</Button>
        </Form.Item>
      </Form>
    </>
  );
};

LogInPanel.propTypes = {
  email: PropTypes.string,
};

LogInPanel.defaultProps = {};

