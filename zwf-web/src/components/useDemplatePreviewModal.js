import React from 'react';

import { Modal, Skeleton, Tag } from 'antd';

import { DemplatePreviewPanel } from 'components/DemplatePreviewPanel';
import { DemplateIcon } from './entityIcon';
import { getDemplate$ } from 'services/demplateService';


export function useDemplatePreviewModal() {
  const [modal, contextHolder] = Modal.useModal()

  const open = (demplateId, name) => {

    if (!demplateId) {
      throw new Error('demplateId is null');
    }

    const modalInstance = modal.info({
      title: <><DemplateIcon /> {name} <Tag color="warning">pending generation</Tag></>,
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

    getDemplate$(demplateId)
      .subscribe((demplate) => {
        modalInstance.update({
          content: <DemplatePreviewPanel
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
