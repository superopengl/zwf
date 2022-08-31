import React from 'react';
import { Typography, Input } from 'antd';
import { OrgRegisterModal } from './OrgRegisterModal';

const { Text } = Typography;

export const OrgRegisterInput = React.memo(props => {

  const [visible, setVisible] = React.useState(false);

  const handleShowModal = () => {
    setVisible(true);
  }

  const handleHideModal = () => {
    setVisible(false);
  }


  return <>
    <Input.Search
      style={{ maxWidth: '500px', }}
      size="large"
      onClick={handleShowModal}
      placeholder="Email"
      enterButton="Try it Now"
      onSearch={handleShowModal}
    />
    <OrgRegisterModal
      visible={visible}
      onOk={handleHideModal}
      onCancel={handleHideModal}
    />
  </>

});


