import React from 'react';

import { Modal } from 'antd';

import { DocTemplatePreviewPanel } from 'components/DocTemplatePreviewPanel';
import { DocTemplateIcon } from './entityIcon';


export function showDocTemplatePreviewModal(docTemplate, options = {}) {
  if (!docTemplate) {
    throw new Error('docTemplate is null');
  }
  const { onClose, allowTest, varBag, type } = options;
  const modalRef = Modal.info({
    title: <><DocTemplateIcon />{docTemplate.name}</>,
    content: <>
      <DocTemplatePreviewPanel
        style={{ marginTop: 20 }}
        value={docTemplate}
        debug={false}
        type={type || 'agent'}
        allowTest={allowTest}
        varBag={varBag || {}}
      />
    </>,
    afterClose: () => {
      onClose?.();
    },
    icon: null,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    footer: null,
    width: 800,
    style: { top: 20 },
    okButtonProps: {
      style: {
        display: 'none'
      }
    }
  });
  return modalRef;
}
