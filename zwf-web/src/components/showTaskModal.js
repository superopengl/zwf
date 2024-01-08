import React from 'react';

import { Modal, Row, Col, Skeleton, Typography } from 'antd';

import { getTask$ } from 'services/taskService';
import { TaskIcon } from 'components/entityIcon';
import { catchError } from 'rxjs/operators';
import { TaskWorkPanel } from './TaskWorkPanel';
import { TaskStatusButton } from './TaskStatusButton';

const { Text } = Typography;

export function showTaskModal(taskId, taskName, currentUserId, currentUserRole) {
  const modalRef = Modal.info({
    title: <><TaskIcon /> {taskName}</>,
    content: <Skeleton active />,
    icon: null,
    closable: false,
    maskClosable: true,
    destroyOnClose: true,
    footer: null,
    width: 800,
  });

  const subscription$ = getTask$(taskId)
    .pipe(
      catchError(e => {
        modalRef.update({
          content: <Text type="danger">Error: {e.message}</Text>
        })
      })
    )
    .subscribe(task => {
      const type = currentUserRole === 'admin' || currentUserRole === 'agent'  ? 'agent' : 'client';
      modalRef.update({
        title: <Row justify="space-between">
          <Col><TaskIcon /> {taskName}</Col>
          <Col><TaskStatusButton /></Col>
        </Row>,
        content: <TaskWorkPanel task={task} type={type} currentUserId={currentUserId} />,
        afterClose: () => {
          subscription$.unsubscribe();
        }
      })
    });
}
