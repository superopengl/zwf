import React from 'react';

import { Modal, Typography } from 'antd';

import { TaskIcon } from 'components/entityIcon';
import { TaskGenerator } from 'pages/MyTask/TaskGenerator';
import { notify } from 'util/notify';
import Icon from '@ant-design/icons';
import { MdOpenInNew } from 'react-icons/md';

const {Link: TextLink} = Typography

export function showCreateTaskModal(taskTemplateId, onFinish) {
  const modalRef = Modal.info({
    title: <><TaskIcon /> Create New Task</>,
    content: <TaskGenerator
      taskTemplateId={taskTemplateId}
      onCancel={() => {
        modalRef.destroy();
      }}
      onCreated={(task) => {
        const { id, name } = task;
        const notifyHandler = notify.success('Task created', <>
          Successfully created task <TextLink href={`/task/${id}`} onClick={() => notifyHandler.close()}>
            <Icon component={() => <MdOpenInNew />} /> {name}
          </TextLink>
        </>);
        modalRef.destroy();
        onFinish?.(task);
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

