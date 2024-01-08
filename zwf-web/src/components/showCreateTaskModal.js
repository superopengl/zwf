import React from 'react';

import { Modal } from 'antd';

import { TaskIcon } from 'components/entityIcon';
import { TaskFormWizard } from 'pages/MyTask/TaskFormWizard';


export function showCreateTaskModal(taskTemplateId, onFinish) {
  const modalRef = Modal.info({
    title: <><TaskIcon /> Create New Task</>,
    content: <TaskFormWizard taskTemplateId={taskTemplateId} onFinish={onFinish} />,
    afterClose: () => {
    },
    icon: null,
    closable: false,
    maskClosable: true,
    destroyOnClose: true,
    footer: null,
    width: 800,
  });
}
