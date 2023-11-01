import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Input, Button, Form, Layout } from 'antd';
import { Logo } from 'components/Logo';
import { forgotPassword$ } from 'services/authService';
import { notify } from 'util/notify';
import PropTypes from 'prop-types';




const { Title } = Typography;
export const ForgotPasswordPanel = withRouter(props => {
  const { email } = props;
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
      () => setLoading(false)
    );
  }

  return <Form layout="vertical" onFinish={handleSubmit} style={{ textAlign: 'left' }} initialValues={email ? { email } : null}>
    <Form.Item label="Registration email" name="email" rules={[{ required: true, whitespace: true, max: 100, type: 'email', message: 'Please input valid email address' }]}>
      <Input placeholder="abc@xyz.com" type="email" allowClear={true} maxLength="100" disabled={loading || !!email} autoFocus={true} />
    </Form.Item>
    <Form.Item style={{ marginTop: '2rem' }}>
      <Button block type="primary" htmlType="submit" disabled={loading}>Send link to email</Button>
    </Form.Item>
  </Form>
});

ForgotPasswordPanel.propTypes = {
  email: PropTypes.string,
};

ForgotPasswordPanel.defaultProps = {};

