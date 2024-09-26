import React from 'react';
import { useLocalstorageState } from 'rooks';
import { Alert, Button } from 'antd';
import styled from 'styled-components';
import { versionMismatchSubject$ } from './showVersionMismatchAlert';
const LAST_ASKED_BACKEND_VERSION = 'lastAskedBackendVersion';

const StyledAlert = styled(Alert)`
background-color: #F7BA1EDD;
position: fixed;
bottom: 0;
left: 0;
right: 0;
z-index: 1000;

.ant-alert-message, a, .ant-btn, .ant-alert-close-text {
    color: #FFFFFF;
    font-size: 14px;
}

.reload-link {
  padding: 0;
  span {
    text-decoration: underline !important;
  }

  &:hover {

  }
}

.ant-alert-close-icon {
  border: 1px solid #FFFFFF;
  border-radius: 4px;
  padding: 8px 16px;
  transition: all 0.2s ease-in-out; 

  &:hover {
    background-color: #FFFFFF33;
    transition: all 0.2s ease-in-out; 
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
    showIcon={false}
    type="warning"
    // message="New version is released"
    message={<>A new version of ZeeWorkflow has been released.<Button type="text" className='reload-link' onClick={handleReloadPage}>Reload the page</Button> to upgrgade.</>}
    closeText="Reload"
    banner
    onClose={handleReloadPage} />;
}
