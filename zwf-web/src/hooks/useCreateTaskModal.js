import React from 'react';
import { Modal } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { TaskGenerator } from 'pages/MyTask/TaskGenerator';
import { BsFillNutFill } from 'react-icons/bs';
import { TaskOrRecurringGenerator } from 'pages/MyTask/TaskOrRecurringGenerator';

export const useCreateTaskModal = () => {
  const [modal, contextHolder] = Modal.useModal();

  const open = ({ femplateId, client, onOk, onCancel, postCreateMode } = {}) => {
    const instance = modal.info({
      icon: null,
      title: <>Create New Task</>,
      maskClosable: false,
      closable: true,
      destroyOnClose: true,
      width: 480,
      focusTriggerAfterClose: false,
      footer: null,
      okButtonProps: {
        style: {
          display: 'none',
        }
      },
      content: <TaskOrRecurringGenerator
        orgClientId={client?.id}
        femplateId={femplateId}
        onCancel={() => {
          onCancel?.();
          instance.destroy();
        }}
        onCreated={(task) => {
          onOk?.(task);
          instance.destroy();
        }}
        postCreateMode={postCreateMode || 'notify'}
      />
    });
  }

  return [open, contextHolder];
};
