import React from 'react';

import { Avatar, Modal, Tag, Typography, Space } from 'antd';

import { changeTaskStatus$ } from 'services/taskService';
import { DeleteOutlined } from '@ant-design/icons';

const { Paragraph } = Typography

export function showArchiveTaskModal(taskId, onFinish) {
  const modalRef = Modal.confirm({
    title: <Space>
      <Avatar icon={<DeleteOutlined />} style={{ backgroundColor: '#ff4d4f' }} />
      Archive Task
    </Space>,
    content: <>
      <Paragraph>
        Archive this task? System will send an email as an officially notification that this task is terminated.
      </Paragraph>
      <Paragraph>
        You can always find this archive task from the task list page by filtering status <Tag>Archived</Tag>
      </Paragraph>
    </>
    ,
    afterClose: () => {
    },
    icon: null,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    // footer: null,
    // width: 600,
    focusTriggerAfterClose: false,
    okButtonProps: {
      danger: true
    },
    okText: 'Archive it!',
    onOk: () => {
      changeTaskStatus$(taskId, 'archived').subscribe(() => onFinish?.());
    },
  });

  return modalRef;
}

