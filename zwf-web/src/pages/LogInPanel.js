import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button, Form,  } from 'antd';
import isEmail from 'validator/es/lib/isEmail';
import { GlobalContext } from '../contexts/GlobalContext';
import { login$ } from 'services/authService';
import { finalize } from 'rxjs/operators';
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
              navigate('/task');
            }
          }
        },
      )
  }

  return (
    <>
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
          <Button block type="primary" size="large" htmlType="submit" disabled={loading}>Login</Button>
        </Form.Item>
      </Form>
    </>
  );
};

LogInPanel.propTypes = {
  email: PropTypes.string,
};

LogInPanel.defaultProps = {};

