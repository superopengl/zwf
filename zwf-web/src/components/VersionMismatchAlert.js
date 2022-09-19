import React from 'react';
import { useLocalstorageState } from 'rooks';
import { Alert } from 'antd';
import styled from 'styled-components';
import { versionMismatchSubject$ } from './showVersionMismatchAlert';
const LAST_ASKED_BACKEND_VERSION = 'lastAskedBackendVersion';

const StyledAlert = styled(Alert)`
background-color: #FF7D00;

.ant-alert-message, a, .ant-btn, .ant-alert-close-text {
    color: #FFFFFF;
    font-size: 14px;
}

a {
  text-decoration: underline;

  &:hover {

  }
}
`;


export const VersionMismatchAlert = (props) => {
  const [visible, setVisible] = React.useState(false);
  const [newVersion, setNewVersion] = React.useState();
  const [currentVersion, setCurrentVersion] = useLocalstorageState(LAST_ASKED_BACKEND_VERSION);

  React.useEffect(() => {
    const $sub = versionMismatchSubject$.subscribe((version) => {
      if (version !== currentVersion) {
        setNewVersion(version);
        setVisible(true);
      }
    });
    return () => $sub.unsubscribe();
  }, []);

  const handleReloadPage = () => {
    if (newVersion) {
      setCurrentVersion(newVersion);
      window.location.reload();
    }
  };

  return !visible ? null : <StyledAlert
    style={{ ...props.style }}
    showIcon={false}
    type="warning"
    // message="New version is released"
    message={<>A new version of ZeeWorkflow has been released.<a onClick={handleReloadPage}>Reload the page</a> to upgrgade.</>}
    closeText="Reload"
    banner
    onClose={handleReloadPage} />;
}
