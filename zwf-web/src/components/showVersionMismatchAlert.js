import React from 'react';
import { Typography, Space, Button, notification, Collapse, Avatar } from 'antd';
import { reactLocalStorage } from 'reactjs-localstorage';
import { notes } from '../release_changes';
import { CaretRightOutlined } from '@ant-design/icons';
import { BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
import { Alert } from 'antd';
import { useLocalstorageState } from 'rooks';

const { Paragraph } = Typography

export const versionMismatchSubject$ = new Subject();

const LAST_ASKED_BACKEND_VERSION = 'lastAskedBackendVersion';

export const VersionMismatchAlert = () => {
  const [visible, setVisible] = React.useState(false);
  const [newVersion, setNewVersion] = React.useState();

  React.useEffect(() => {
    const $sub = versionMismatchSubject$.subscribe((version) => {
      setNewVersion(version);
      setVisible(true)
    });
    return () => $sub.unsubscribe();
  }, []);

  const handleReloadPage = () => {
    if(newVersion) {
      reactLocalStorage.set(LAST_ASKED_BACKEND_VERSION, newVersion);
      window.location.reload();
    }
  }

  return !visible ? null : <Alert
    showIcon
    type="warning"
    message="New version is released"
    description={<>
      <Paragraph>A new version of ZeeWorkflow has been released with below changes. Reload the page to upgrade.</Paragraph>
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginTop: 20 }}>
        <Button type="primary" autoFocus onClick={handleReloadPage}>Reload Page</Button>
      </Space>
    </>}
    closable
    banner
    onClose={() => setVisible(false)}
  />
}

export const showVersionMismatchAlert = (webappVersion, backendVersion) => {
  if (webappVersion === backendVersion) {
    return;
  }
  const lastAskedBackendVersion = reactLocalStorage.get(LAST_ASKED_BACKEND_VERSION);
  if (lastAskedBackendVersion === backendVersion) {
    return;
  }

  versionMismatchSubject$.next(backendVersion);
}