import React from 'react';

import { Modal, Typography, Space, Button, Checkbox, Row, Col, Avatar } from 'antd';
import Icon from '@ant-design/icons';
import { FaFileSignature, FaSignature } from 'react-icons/fa';
import { FileIcon } from '../components/FileIcon';
import { getTaskDocDownloadUrl, signTaskDocs$ } from 'services/taskService';
import { Loading } from '../components/Loading';
import { catchError, finalize } from 'rxjs/operators';
import { TaskDocName } from 'components/TaskDocName';

const { Paragraph, Link: TextLink } = Typography;

const Content = props => {
  const { taskDoc, onCancel, onOk } = props;

  const [loading, setLoading] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [hasRead, setHasRead] = React.useState(false);

  const handleSign = () => {
    setLoading(true);
    signTaskDocs$(taskDoc.id).pipe(
      finalize(() => setLoading(false))
    ).subscribe(() => {
      onOk();
    })
  }

  return <Loading loading={loading}>
    <Paragraph>
      Please view and sign the document. Click below file to download or open it before signing.
    </Paragraph>
    <Space direction="vertical" style={{ width: '100%' }}>
      {/* <TextLink href={getTaskDocDownloadUrl(taskDoc.fileId)} target="_blank" onClick={() => setAgreed(true)} strong={!hasRead}>
        <Space>
          <FileIcon name={taskDoc.name} />
          {taskDoc.name}
        </Space>
      </TextLink> */}
      <TaskDocName taskDoc={taskDoc} showOverlay={false} onClick={() => {
        setAgreed(true)
        setHasRead(true)
      }}
        strong={!hasRead}
      />
      <Checkbox checked={agreed} onClick={e => setAgreed(e.target.checked)} >
        I have read and agree on the <TextLink target="_blank" href="/terms_of_use">terms of use</TextLink>
      </Checkbox>
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 20 }}>
        <Button type="text" onClick={onCancel} autoFocus>Cancel</Button>
        <Button type="primary" onClick={handleSign} disabled={!agreed} icon={<Icon component={FaSignature} />}>Sign</Button>
      </Space>
    </Space>
  </Loading>
}

export const useSignTaskDocModal = () => {
  const [modal, contextHolder] = Modal.useModal();

  const icon = <Avatar src={<Icon component={FaSignature} />} style={{ backgroundColor: 'red', color: 'white' }} />

  const open = ({ taskDoc, onOk }) => {
    const modalRef = modal.info({
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
      // icon: <Icon component={() => <Avatar src={<Icon component={FaSignature} />} style={{ backgroundColor: 'red', color: 'white' }} />} />,
      icon: <Icon component={FaSignature} />,
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      autoFocusButton: 'cancel',
      focusTriggerAfterClose: true,
      footer: null,
      width: 600,
      // style: { top: 20 },
      okButtonProps: {
        style: {
          display: 'none'
        }
      }
    });
  }

  return [open, contextHolder];
}