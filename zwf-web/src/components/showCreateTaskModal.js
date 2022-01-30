import React from 'react';

import { Modal, Row, Col, Skeleton, Typography } from 'antd';

import { getTask$ } from 'services/taskService';
import { TaskIcon } from 'components/entityIcon';
import { catchError } from 'rxjs/operators';
import { TaskWorkPanel } from './TaskWorkPanel';
import { TaskStatusButton } from './TaskStatusButton';
import { TaskFormWizard } from 'pages/MyTask/TaskFormWizard';

const { Text } = Typography;

export function showCreateTaskModal(taskTemplateId) {
  const modalRef = Modal.info({
    title: <><TaskIcon /> Create New Task</>,
    content: <TaskFormWizard />,
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
