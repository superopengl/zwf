import React from 'react';
import { FloatButton } from 'antd';
import { useAuthUser } from 'hooks/useAuthUser';
import { ExportOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { unimpersonate$ } from 'services/authService';

const StyledFloatButton = styled(FloatButton)`
top: 0;
left: -4px;
bottom: auto;
z-index: 300;
.ant-float-btn-body {
  background-color: #F53F3F;

  &:hover {
    background-color: #F53F3F88;

  }

  .anticon {
    color: #FFFFFFCC;
  }
}`

const WarningBar = styled.div`
position: fixed;
top: 0;
left: 0;
right: 0;
height: 4px;
background-color: #F53F3F;
z-index: 300;
`;

export const UnimpersonatedFloatButton = () => {
  const [user, setAuthUser] = useAuthUser();

  const impersonated = user?.impersonatedBy;
  
  const handleUmimpersonate = () => {
    unimpersonate$().subscribe(user => {
      setAuthUser(user, '/landing');
    })
  }

  return impersonated ? <>
    <WarningBar />
    <StyledFloatButton
      icon={<ExportOutlined />}
      shape="square"
      tooltip="Unimpersonate"
      onClick={handleUmimpersonate}
    />
  </> : null;
};
