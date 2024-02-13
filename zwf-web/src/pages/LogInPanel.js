import React from 'react';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Divider } from 'antd';
import isEmail from 'validator/es/lib/isEmail';
import { GlobalContext } from '../contexts/GlobalContext';
import { login$ } from 'services/authService';
import { countUnreadMessage$ } from 'services/messageService';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import { zip, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { getMyOrgProfile$ } from 'services/orgService';
import PropTypes from 'prop-types';
import * as queryString from 'query-string';


export const LogInPanel = withRouter(props => {
  const { email } = props;

  const { r: returnUrl } = queryString.parse(props.location.search);

  const [loading, setLoading] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { setUser, setNotifyCount } = context;

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
        switchMap(user => {
          return zip(
            of(user),
            user ? countUnreadMessage$() : of(0), // If logged in, get message count
            user?.role === 'admin' ? getMyOrgProfile$() : of(null) // If it's org admin, check if org profile is complete
          );
        })
      )
      .subscribe(
        ([user, count, org]) => {
          if (user) {
            setUser(user);
            setNotifyCount(count);

            if (user.role === 'admin' && !org) {
              props.history.push(returnUrl || '/onboard')
            } else {
              props.history.push(returnUrl || '/');
            }
          }
        },
      ).add(
        () => {
          setLoading(false);
        });
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
          <Button block type="primary" htmlType="submit" disabled={loading}>Log In</Button>
        </Form.Item>
      </Form>
    </>
  );
});

LogInPanel.propTypes = {
  email: PropTypes.string,
};

LogInPanel.defaultProps = {};

