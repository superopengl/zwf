import React from 'react';
import { Typography, Space, Button, notification, Collapse } from 'antd';
import { reactLocalStorage } from 'reactjs-localstorage';
import { notes } from '../release_changes';
import { CaretRightOutlined } from '@ant-design/icons';
const { Paragraph } = Typography

const LAST_ASKED_BACKEND_VERSION = 'lastAskedBackendVersion';

const VersionMismatchModalContent = React.memo(props => {
  const { onClose } = props;

  const handleReloadPage = () => {
    onClose();
    window.location.reload();
  }

  return <>
    <Paragraph>A new version of platform has been released. Reload the page to upgrade.</Paragraph>
    <Collapse ghost bordered={false} defaultActiveKey={['tag']}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      style={{position: 'relative', left: -16}}
    >
      <Collapse.Panel header={"What's new?"} key="tag">
        <ul>
          {notes.split(/\n/)
            .map(x => x.trim())
            .filter(x => x)
            .map(x => <li key={x}>{x}</li>)
          }
        </ul>
      </Collapse.Panel>
    </Collapse>
    <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 20 }}>
      <Button type="text" onClick={onClose}>No, later</Button>
      <Button type="primary" autoFocus onClick={handleReloadPage}>Reload Page</Button>
    </Space>
  </>
});

export const showVersionMismatchModal = (webappVersion, backendVersion) => {
  if (webappVersion === backendVersion) {
    return;
  }
  const lastAskedBackendVersion = reactLocalStorage.get(LAST_ASKED_BACKEND_VERSION);
  if (lastAskedBackendVersion === backendVersion) {
    return;
  }

  const notificationKey = 'versionCheck';
  notification.info({
    message: 'New version is released',
    description: <VersionMismatchModalContent onClose={() => {
      reactLocalStorage.set(LAST_ASKED_BACKEND_VERSION, backendVersion)
      notification.close(notificationKey);
    }} />,
    key: notificationKey,
    duration: 0,
    placement: 'topLeft',
    onClose: () => {
      reactLocalStorage.set(LAST_ASKED_BACKEND_VERSION, backendVersion)
    }
  });
}