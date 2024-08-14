import React from 'react';
import { Typography, Input, Button, Space } from 'antd';
import { OrgRegisterModal } from './OrgRegisterModal';
import { MailOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;


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

  const [visible, setVisible] = React.useState(false);

  const handleShowModal = (e) => {
    e.stopPropagation();
    setVisible(true);
  }

  const handleHideModal = () => {
    setVisible(false);
  }


  return <Space>
    <StyledInput
      prefix={<MailOutlined style={{color: 'rgba(0, 0, 0, 0.3)'}} />}
      size="large"
      readOnly={true}
      placeholder="Email"
      onClick={handleShowModal}
      // enterButton="Try it Now"
      // onSearch={handleShowModal}
    />
    <Button type="primary" size="large" onClick={handleShowModal} style={{color: '#ffffff'}}>Try it Now</Button>
    <OrgRegisterModal
      visible={visible}
      onOk={handleHideModal}
      onCancel={handleHideModal}
    />
  </Space>

});


