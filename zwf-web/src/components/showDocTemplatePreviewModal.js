import React from 'react';

import { Modal } from 'antd';

import { DocTemplatePreviewPanel } from 'components/DocTemplatePreviewPanel';
import { DocTemplateIcon } from './entityIcon';


export function showDocTemplatePreviewModal(docTemplate, type = "agent", onClose = () => { }) {
  if (!docTemplate) {
    throw new Error('docTemplate is null');
  }
  const modalRef = Modal.info({
    title: <><DocTemplateIcon />{docTemplate.name}</>,
    content: <>
      <DocTemplatePreviewPanel
      style={{marginTop: 20}}
        value={docTemplate}
        debug={false}
        type={type}
      />
    </>,
    afterClose: () => {
      onClose();
    },
    icon: null,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    footer: null,
    width: 700,
    style: { top: 20 },
    okButtonProps: {
      style: {
        display: 'none'
      }
    }
  });
  return modalRef;
}
