import React from 'react';
import styled from 'styled-components';
import { Link, withRouter } from 'react-router-dom';
import { Typography, Button, Modal, Form, Input, Checkbox, Layout, Divider } from 'antd';
import { Logo } from 'components/Logo';
import { signIn } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import GoogleSsoButton from 'components/GoogleSsoButton';
import GoogleLogoSvg from 'components/GoogleLogoSvg';
import PropTypes from 'prop-types';
import { Alert } from 'antd';
import { saveProfile } from 'services/userService';
import { notify } from 'util/notify';
const { Title } = Typography;


const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  // background-color: #f3f3f3;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
  // background-color: #f3f3f3;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;

const ProfileForm = (props) => {
  const { user, initial, onOk } = props;
  const [sending, setSending] = React.useState(false);

  console.log('profile', user);
  const handleSave = async (values) => {
    if (sending) {
      return;
    }

    try {
      setSending(true);

      await saveProfile(user.id, values);

      notify.success('Successfully saved profile!')

      Object.assign(user, values);
      onOk(user);
    } finally {
      setSending(false);
    }
  }

  const isBuiltinAdmin = user.email === 'admin@filedin.io';

  return (
    <Form layout="vertical" onFinish={handleSave} style={{ textAlign: 'left' }} initialValues={user}>
      {!initial && <Form.Item
        label="Email"
        name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} 
        disabled={isBuiltinAdmin}
        maxLength="100" autoFocus={!isBuiltinAdmin} />
      </Form.Item>}
      <Form.Item label="Given Name" name="givenName" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Given name" autoComplete="given-name" allowClear={true} maxLength="100" autoFocus={isBuiltinAdmin} />
      </Form.Item>
      <Form.Item label="Surname" name="surname" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Surname" autoComplete="family-name" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item label="Phone" name="phone" rules={[{ required: false, whitespace: true, max: 100, message: ' ' }]}>
        <Input placeholder="Phone number" autoComplete="tel" allowClear={true} maxLength="100" />
      </Form.Item>
      <Form.Item style={{ marginTop: '1rem' }}>
        <Button block type="primary" htmlType="submit" disabled={sending}>Save</Button>
      </Form.Item>
    </Form>
  );
}

ProfileForm.propTypes = {
  user: PropTypes.any.isRequired,
  initial: PropTypes.bool
};

ProfileForm.defaultProps = {
  initial: false
};

export default withRouter(ProfileForm);
