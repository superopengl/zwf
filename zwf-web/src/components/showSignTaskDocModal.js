import React from 'react';

import { Modal, Typography, Space, Button, Checkbox, Row, Col } from 'antd';
import Icon from '@ant-design/icons';
import { FaFileSignature, FaSignature } from 'react-icons/fa';
import { FileIcon } from './FileIcon';
import { getTaskDocDownloadUrl } from 'services/taskDocService';

const { Paragraph, Link: TextLink } = Typography;

const Content = props => {
  const { taskDoc, onCancel, onOk } = props;

  const hasRead = !!taskDoc.lastClientReadAt
  const [agreed, setAgreed] = React.useState(false);


  const handleSign = () => {
    onOk();
  }

  return <>
    <Paragraph>
      Please view and sign the document. Click below file to download or open it before signing.
    </Paragraph>
    <Space direction="vertical" style={{ width: '100%' }}>
      <TextLink href={getTaskDocDownloadUrl(taskDoc.fileId)} target="_blank" onClick={() => setAgreed(true)} strong={!hasRead}>
        <Space>
          <FileIcon name={taskDoc.name} />
          {taskDoc.name}
        </Space>
      </TextLink>
      <Checkbox checked={agreed} onClick={e => setAgreed(e.target.checked)} >I have read the file and agree with the term and conditions.</Checkbox>
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 20 }}>
        <Button type="text" onClick={onCancel}>Cancel</Button>
        <Button type="primary" onClick={handleSign} disabled={!agreed} icon={<Icon component={FaSignature} />}>Sign</Button>
      </Space>
    </Space>
  </>
}

export function showSignTaskDocModal(taskDoc, options = {}) {
  if (!taskDoc) {
    throw new Error('taskDoc is null');
  }
  const { onOk } = options;
  const modalRef = Modal.info({
    title: 'Sign document',
    content: <Content taskDoc={taskDoc}
      onCancel={() => modalRef.destroy()}
      onOk={() => {
        modalRef.destroy();
        onOk();
      }} />,
    afterClose: () => {
      // onClose?.();
    },
    icon: <Icon component={FaSignature} />,
    closable: true,
    maskClosable: true,
    destroyOnClose: true,
    footer: null,
    width: 600,
    // style: { top: 20 },
    okButtonProps: {
      style: {
        display: 'none'
      }
    }
  });
  return modalRef;
}
