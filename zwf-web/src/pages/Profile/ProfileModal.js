import React from 'react';
import { withRouter } from 'react-router-dom';
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
      title="Update Profile"
      closable={true}
      maskClosable={true}
      destroyOnClose={true}
      footer={null}
      width={360}
      visible={visible}
      onOk={onOk}
      {...props}>
      <ProfileForm user={{
        id: user.id,
        avatar: user.profile.avatarFileId,
        email: user.profile.email,
        givenName: user.profile.givenName,
        surname: user.profile.surname,
        locale: user.profile.locale
      }} onOk={handlePostSave} />
    </Modal>
  );
};

ProfileModal.propTypes = {};

ProfileModal.defaultProps = {};

export default withRouter(ProfileModal);
