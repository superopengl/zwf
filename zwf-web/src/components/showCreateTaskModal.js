import React from 'react';

import { Modal } from 'antd';

import { TaskIcon } from 'components/entityIcon';
import { TaskGenerator } from 'pages/MyTask/TaskGenerator';


export function showCreateTaskModal(taskTemplateId, onFinish) {
  const modalRef = Modal.info({
    title: <><TaskIcon /> Create New Task</>,
    content: <TaskGenerator
      taskTemplateId={taskTemplateId}
      onCancel={() => {
        modalRef.destroy();
      }}
      onCreated={() => {
        modalRef.destroy();
        onFinish?.();
      }} 
      />,
    afterClose: () => {
    },
    icon: null,
    closable: true,
    maskClosable: false,
    destroyOnClose: true,
    footer: null,
    width: 600,
    focusTriggerAfterClose: false,
    okButtonProps: {
      style: {
        display: 'none'
      }
    }
  });

  return modalRef;
}

