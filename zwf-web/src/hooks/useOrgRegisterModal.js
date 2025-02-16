import React from 'react';
import { Modal, Typography } from 'antd';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';
import { useOrgRegisterSuccessfullyModal } from './useOrgRegisterSuccessfullyModal';
const { Title } = Typography;

export const useOrgRegisterModal = () => {
  const [modalForm, formContextHolder] = Modal.useModal();
  const [openSuccessModal, successContextHolder] = useOrgRegisterSuccessfullyModal()

  const open = ({ onOk, onCancel } = {}) => {
    const handleFinish = (email) => {
      formModalInstance.destroy();
      openSuccessModal({ email });
      onOk?.();
    }

    const formModalInstance = modalForm.info({
      icon: null,
      content: <>
        <Title level={2} style={{textAlign: 'center'}}>New Organization</Title>
        <OrgSignUpForm onOk={handleFinish} />,
      </>,
      maskClosable: true,
      closable: false,
      footer: null,
      destroyOnClose: true,
      onOk,
      onCancel,
    })
  }

  return [open, <>
    <div>{formContextHolder}</div>
    <div>{successContextHolder}</div>
  </>];

};


