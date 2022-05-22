import React from 'react';
import styled from 'styled-components';

import { Typography, Button, Form, Input, Upload, Avatar } from 'antd';
import PropTypes from 'prop-types';
import { saveProfile } from 'services/userService';
import { notify } from 'util/notify';
import { LocaleSelector } from 'components/LocaleSelector';
import { UserOutlined } from '@ant-design/icons';
import { UserAvatar } from 'components/UserAvatar';
const { Title } = Typography;

const Container = styled.div`
.avatar-field {
  text-align: center;
}
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

  const isBuiltinAdmin = (user.email) === 'admin@zeeworkflow.com';

  return (
    <Container>
    <Form layout="vertical" onFinish={handleSave} style={{ textAlign: 'left' }} initialValues={user}>
      <Form.Item
        name="avatar"
        className="avatar-field"
      >
        <UserAvatar size={120} editable={true} userId={user.id} givenName={user.givenName} surname={user.surname}/>
      </Form.Item>
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
    </Container>
  );
}

ProfileForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    email: PropTypes.string.isRequired,
    givenName: PropTypes.string.isRequired,
    surname: PropTypes.string.isRequired,
    locale: PropTypes.string
  }).isRequired,
  initial: PropTypes.bool
};

ProfileForm.defaultProps = {
  initial: false
};

export default ProfileForm;
