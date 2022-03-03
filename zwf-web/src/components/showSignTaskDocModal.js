import React from 'react';

import { Modal, Typography, Space, Button } from 'antd';
import Icon from '@ant-design/icons';
import { DocTemplatePreviewPanel } from 'components/DocTemplatePreviewPanel';
import { DocTemplateIcon } from './entityIcon';
import { FaFileSignature, FaSignature } from 'react-icons/fa';
import { TaskDocItem } from './TaskDocItem';

const { Paragraph } = Typography;

export function showSignTaskDocModal(taskDoc, options = {}) {
  if (!taskDoc) {
    throw new Error('taskDoc is null');
  }
  const { onOk } = options;
  const modalRef = Modal.info({
    title: 'Sign document',
    content: <>
      <Paragraph>
        Please view and sign the document. Click below file to download or open it before signing.
      </Paragraph>
      <TaskDocItem taskDoc={taskDoc} strong={true} align="center" />
      <Space style={{width: '100%', justifyContent: 'flex-end'}}>
        <Button type="text" onClick={() => modalRef.destroy()}>Cancel</Button>
        <Button type="primary" onClick={() => modalRef.destroy()}>Sign</Button>
      </Space>
    </>,
    afterClose: () => {
      // onClose?.();
    },
    icon: <Icon component={() => <FaFileSignature />} />,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    footer: null,
    // width: 700,
    // style: { top: 20 },
    okButtonProps: {
      style: {
        display: 'none'
      }
    }
  });
  return modalRef;
}
