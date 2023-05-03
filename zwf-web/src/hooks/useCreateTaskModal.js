import React from 'react';
import { Modal } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { TaskGenerator } from 'pages/MyTask/TaskGenerator';
import { BsFillNutFill } from 'react-icons/bs';

export const useCreateTaskModal = () => {
  const [modal, contextHolder] = Modal.useModal();

  const open = ({ taskTemplateId, client, onOk, onCancel, postCreateMode } = {}) => {
    const instance = modal.info({
      icon: null,
      title: <><TaskIcon /> Create New Task</>,
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
      content: <TaskGenerator
        taskTemplateId={taskTemplateId}
        client={client}
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
