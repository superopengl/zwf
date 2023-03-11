import React from 'react';
import { Typography, Input, Button, Space, Grid } from 'antd';
import { useOrgRegisterModal } from '../hooks/useOrgRegisterModal';
import { MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;
const {useBreakpoint} = Grid;


const StyledInput = styled(Input)`
max-width: 500px;

  box-shadow: 0 0 0 2px rgb(15 191 196 / 20%);
  border-color: #0FBFC4;
  border-size: 2px;

input {
  font-size: 14px;
}
`;

export const OrgRegisterInput = React.memo(props => {

  const [openModal, contextHolder] = useOrgRegisterModal();

  const handleShowModal = (e) => {
    openModal();
  }


  return <Space>
    {/* <StyledInput
      prefix={<MailOutlined style={{color: 'rgba(0, 0, 0, 0.3)'}} />}
      size="large"
      readOnly={true}
      placeholder="Email"
      onClick={handleShowModal}
    /> */}
    <Button type="primary" size="large" onClick={handleShowModal} style={{color: '#ffffff'}}>Try it Now</Button>
    {contextHolder}
  </Space>

});


