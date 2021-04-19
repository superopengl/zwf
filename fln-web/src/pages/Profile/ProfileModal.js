import React from 'react';
import { withRouter } from 'react-router-dom';
import ProfileForm from '../Profile/ProfileForm';
import { GlobalContext } from 'contexts/GlobalContext';
import { Modal } from 'antd';

const ProfileModal = props => {
  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;

  const { visible, onOk } = props;

  const handlePostSave = (updatedUser) => {
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
      visible={visible}
      onOk={onOk}
      {...props}>
      <ProfileForm user={user} onOk={updatedUser => handlePostSave(updatedUser)} />
    </Modal>
  );
};

ProfileModal.propTypes = {};

ProfileModal.defaultProps = {};

export default withRouter(ProfileModal);
