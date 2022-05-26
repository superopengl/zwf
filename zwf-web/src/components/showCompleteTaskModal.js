import React from 'react';

import { Avatar, Modal, Tag, Typography, Space } from 'antd';

import { changeTaskStatus$ } from 'services/taskService';
import { CheckOutlined, DeleteOutlined } from '@ant-design/icons';

const { Paragraph } = Typography

export function showCompleteTaskModal(taskId, onFinish) {
  const modalRef = Modal.confirm({
    title: <Space>
      <Avatar icon={<CheckOutlined />} style={{ backgroundColor: '#52c41a' }} />
      Complete Task
    </Space>,
    content: <>
      <Paragraph>
        Complete this task? System will send an email as an officially notification to the client.
      </Paragraph>
      <Paragraph>
        You can always reopen this task later on by changing its status to other value.
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
    focusTriggerAfterClose: true,
    okButtonProps: {
      type: 'primary'
    },
    autoFocusButton: 'cancel',
    okText: 'Complete it!',
    onOk: () => {
      changeTaskStatus$(taskId, 'done').subscribe(() => onFinish?.());
    },
    cancelButtonProps: {
      type: 'text'
    }
  });

  return modalRef;
}

