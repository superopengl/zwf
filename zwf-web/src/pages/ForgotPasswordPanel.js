import React from 'react';
import { Input, Button, Form } from 'antd';
import { forgotPassword$ } from 'services/authService';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';

export const ForgotPasswordPanel = props => {
  const { email, onFinish, okText, returnUrl } = props;
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async values => {
    if (loading) {
      return;
    }

    setLoading(true);

    const { email } = values;

    forgotPassword$(email, returnUrl).subscribe(
      () => {
        notify.success(
          'Successfully sent out email',
          <>An email with the set password link was sent out to <strong>{email}</strong>. Please check your email to continue set password process.</>
        );
        onFinish();
      },
      () => setLoading(false)
    );
  }

  return <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }} initialValues={email ? { email } : null}>
    <Form.Item label="Registration email" name="email" rules={[{ required: true, whitespace: true, max: 100, type: 'email', message: 'Please input valid email address' }]}>
      <Input placeholder="abc@xyz.com" type="email" allowClear={true} maxLength="100" disabled={loading || !!email} autoFocus={true} />
    </Form.Item>
    <Form.Item style={{ marginTop: '2rem' }}>
      <Button block type="primary" htmlType="submit" disabled={loading}>{okText}</Button>
    </Form.Item>
  </Form>
};

ForgotPasswordPanel.propTypes = {
  email: PropTypes.string,
  onFinish: PropTypes.func,
  okText: PropTypes.string,
  returnUrl: PropTypes.string,
};

ForgotPasswordPanel.defaultProps = {
  onFinish: () => {},
  okText: 'Send set password link to email'
};

