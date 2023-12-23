import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Modal, Row, Col, Skeleton, Typography } from 'antd';
import PropTypes from 'prop-types';

import { getTask, getTask$ } from 'services/taskService';
import MyTaskSign from '../pages/MyTask/MyTaskSign';
import TaskFormWizard from '../pages/MyTask/TaskFormWizard';
import MyTaskReadView from '../pages/MyTask/MyTaskReadView';
import { MessageFilled } from '@ant-design/icons';
import { TaskStatus } from 'components/TaskStatus';
import { Loading } from 'components/Loading';
import { TaskIcon } from 'components/entityIcon';
import { catchError } from 'rxjs/operators';
import { TaskFormPanel } from './TaskFormPanel';
import { TaskChatPanel } from 'components/TaskChatPanel';
import { TaskWorkPanel } from './TaskWorkPanel';

const { Text } = Typography;

export function showTaskModal(taskId, taskName, currentUserId, currentUserRole) {
  const modalRef = Modal.info({
    title: <><TaskIcon /> {taskName}</>,
    content: <Skeleton active />,
    icon: null,
    closable: true,
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
        title: <><TaskIcon /> {taskName}</>,
        content: <TaskWorkPanel task={task} type={type} currentUserId={currentUserId} />,
        afterClose: () => {
          subscription$.unsubscribe();
        }
      })
    });
}
