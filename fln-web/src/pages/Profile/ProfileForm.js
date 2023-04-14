import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Typography, Button, Form, Input, Layout } from 'antd';
import PropTypes from 'prop-types';
import { saveProfile } from 'services/userService';
import { notify } from 'util/notify';
import { LocaleSelector } from 'components/LocaleSelector';
const { Title } = Typography;






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

  const isBuiltinAdmin = user.profile.email === 'admin@filedin.io';

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
      <Form.Item label="Language" name="locale"
        rules={[{ required: true, whitespace: true, max: 200, message: ' ' }]}
        help="Requires refreshing page to pick up the change."
      >
        <LocaleSelector />
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
