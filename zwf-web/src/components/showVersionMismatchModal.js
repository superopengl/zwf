import React from 'react';
import { Typography, Space, Button, notification } from 'antd';
import { reactLocalStorage } from 'reactjs-localstorage';

const { Paragraph, Link: TextLink } = Typography

const LAST_ASKED_BACKEND_VERSION = 'lastAskedBackendVersion';

const VersionMismatchModalContent = React.memo(props => {
  const { onClose } = props;

  const handleReloadPage = () => {
    onClose();
    window.location.reload();
  }

  return <>
    <Paragraph>A new version of platform has been released. Reload the page to upgrade.</Paragraph>
    <Paragraph><TextLink href="/release_notes" target="_blank">See release notes.</TextLink></Paragraph>
    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
      <Button type="text" onClick={onClose}>No, later</Button>
      <Button type="primary" autoFocus onClick={handleReloadPage}>Reload Page</Button>
    </Space>
  </>
});

export const showVersionMismatchModal = (webappVersion, backendVersion) => {
  if(webappVersion === backendVersion) {
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