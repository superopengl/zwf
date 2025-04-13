import React from 'react';

import { Modal, Skeleton, Tag } from 'antd';

import { DocTemplatePreviewPanel } from 'components/DocTemplatePreviewPanel';
import { DocTemplateIcon } from './entityIcon';
import { getDocTemplate$ } from 'services/docTemplateService';


export function useDocTemplatePreviewModal() {
  const [modal, contextHolder] = Modal.useModal()

  const open = (demplateId, name) => {

    if (!demplateId) {
      throw new Error('demplateId is null');
    }

    const modalInstance = modal.info({
      title: <><DocTemplateIcon /> {name} <Tag color="warning">pending generation</Tag></>,
      content: <Skeleton />,
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
      },
      zIndex: 4000,
    });

    getDocTemplate$(demplateId)
      .subscribe((demplate) => {
        modalInstance.update({
          content: <DocTemplatePreviewPanel
            style={{ marginTop: 20 }}
            value={demplate}
            debug={false}
            allowTest={false}
            varBag={{}}
          />
        });
      });
  }

  return [open, contextHolder];
}
