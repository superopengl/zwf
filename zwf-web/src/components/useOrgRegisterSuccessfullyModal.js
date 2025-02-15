import React from 'react';
import { Typography } from 'antd';
import { Modal } from 'antd';

const { Text, Paragraph } = Typography;

export const useOrgRegisterSuccessfullyModal = () => {
  const [modalSuccess, successContextHolder] = Modal.useModal();

  const open = ({email, onOk, onCancel}) => {
    modalSuccess.success({
      title: '🎉 Successfully signed up!',
      content: <>
        <Paragraph>
          Thank you for signing up for ZeeWorkflow. An email containing an activation link for your account will be sent to <Text strong>{email}</Text> shortly.
        </Paragraph>
      </>,
      maskClosable: true,
      closable: true,
      destroyOnClose: true,
      onOk,
      onCancel,
    })
  }

  return [open, successContextHolder];

};


