import React from 'react';
import { Typography } from 'antd';
import { Modal } from 'antd';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';

const { Text } = Typography;

export const OrgRegisterModal = props => {

  const { visible, onOk, onCancel } = props;


  return <Modal
    title="Org Registration"
    visible={visible}
    onCancel={onCancel}
    destroyOnClose
    maskClosable={false}
    closable={true}
    footer={null}
  >
    <OrgSignUpForm onOk={onOk} />
  </Modal>

};


