import React from 'react';
import styled from 'styled-components';

import { Typography, Button, Form, Input } from 'antd';
import PropTypes from 'prop-types';
import { refreshUserNameCardCache, saveProfile$ } from 'services/userService';
import { UserAvatar } from 'components/UserAvatar';
import { finalize } from 'rxjs';

const Container = styled.div`
.avatar-field {
  text-align: center;
}
`;

const ProfileForm = (props) => {
  const { user, initial, onOk } = props;
  const [loading, setLoading] = React.useState(false);

  const handleSave = (values) => {
    if (loading) {
      return;
    }

    setLoading(true);
    saveProfile$(user.id, values).pipe(
      finalize(() => setLoading(false))
    ).subscribe(() => {
      // notify.success('Successfully saved profile!')
      refreshUserNameCardCache(user.id);
      Object.assign(user, values);
      onOk(user);
    });
  }

  return (
    <Container>
      <Form layout="vertical" onFinish={handleSave} style={{ textAlign: 'left' }} initialValues={user} requiredMark={false}>
        <Form.Item
          name="avatarFileId"
          className="avatar-field"
        >
          <UserAvatar size={120} editable={true} userId={user.id} givenName={user.givenName} surname={user.surname} />
        </Form.Item>
        {!initial && <Form.Item
          label="Email"
          name="email" rules={[{ type: 'email', whitespace: true, max: 100, message: ' ' }]}>
          <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true}
            disabled={true}
            maxLength="100" />
        </Form.Item>}
        <Form.Item label="Given Name" name="givenName" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
          <Input placeholder="Given name" autoComplete="given-name" allowClear={true} maxLength="100" autoFocus={true} />
        </Form.Item>
        <Form.Item label="Surname" name="surname" rules={[{ required: true, whitespace: true, max: 100, message: ' ' }]}>
          <Input placeholder="Surname" autoComplete="family-name" allowClear={true} maxLength="100" />
        </Form.Item>
        {/* <Form.Item label="Language" name="locale"
        rules={[{ required: true, whitespace: true, max: 200, message: ' ' }]}
        help="Requires refreshing page to pick up the change."
      >
        <LocaleSelector />
      </Form.Item> */}
        <Form.Item style={{ marginTop: '1rem' }}>
          <Button block type="primary" htmlType="submit" disabled={loading} loading={loading}>Save</Button>
        </Form.Item>
      </Form>
    </Container>
  );
}

ProfileForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    avatarFileId: PropTypes.string,
    email: PropTypes.string.isRequired,
    givenName: PropTypes.string,
    surname: PropTypes.string,
    locale: PropTypes.string
  }).isRequired,
  initial: PropTypes.bool
};

ProfileForm.defaultProps = {
  initial: false
};

export default ProfileForm;
