import React from 'react';

import ProfileForm from '../Profile/ProfileForm';
import { GlobalContext } from 'contexts/GlobalContext';
import { Modal } from 'antd';
import { getAuthUser } from 'services/authService';

const ProfileModal = props => {
  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;

  const { visible, onOk } = props;

  const handlePostSave = async () => {
    const updatedUser = await getAuthUser();
    setUser(updatedUser);
    onOk();
  }


  return (
    <Modal
      title="User Profile"
      closable={true}
      maskClosable={true}
      destroyOnClose={true}
      footer={null}
      width={360}
      visible={visible}
      onOk={onOk}
      {...props}>
      <ProfileForm user={user} onOk={handlePostSave} />
    </Modal>
  );
};

ProfileModal.propTypes = {};

ProfileModal.defaultProps = {};

export default ProfileModal;
