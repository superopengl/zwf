import React from 'react';

import ProfileForm from '../Profile/ProfileForm';
import { Modal } from 'antd';
import { getAuthUser$ } from 'services/authService';
import { useAuthUser } from 'hooks/useAuthUser';

const ProfileModal = props => {
  const [user, setAuthUser] = useAuthUser();

  const { onOk } = props;

  const handlePostSave = () => {
    getAuthUser$().subscribe(user => {
      setAuthUser(user);
      onOk();
    });
  }


  return (
    <Modal
      title="User Profile"
      closable={true}
      maskClosable={true}
      destroyOnClose={true}
      footer={null}
      width={360}
      {...props}>
      <ProfileForm user={user} onOk={handlePostSave} />
    </Modal>
  );
};

ProfileModal.propTypes = {};

ProfileModal.defaultProps = {};

export default ProfileModal;
