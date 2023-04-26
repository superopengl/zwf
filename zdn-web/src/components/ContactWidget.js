
import React from 'react';
import { Link } from 'react-router-dom';
import { Affix, Button, Layout, Modal } from 'antd';
import { AiOutlineMessage } from "react-icons/ai";
import styled from 'styled-components';
import ContactForm from 'components/ContactForm';

const AffixContactButton = styled(Button)`
width: 60px;
height: 60px;
display: flex;
align-items: center;
justify-content: center;
border: none;
padding: 0;
background-color: rgba(19,194,194,0.8);
color: white;
// box-shadow: 1px 1px 5px #222222;
border: 2px solid white;

&:focus,&:hover,&:active {
color: white;
background-color: rgba(19,194,194,0.8);
border: 2px solid white;
}
`;
export const ContactWidget = () => {
  const [modalVisible, setModalVisible] = React.useState(false);

  return <>
    <Affix style={{ position: 'fixed', bottom: 80, right: 20 }}>
      <AffixContactButton type="primary" shape="circle" size="large" onClick={() => setModalVisible(true)}>
        <AiOutlineMessage size={36} />
      </AffixContactButton>
    </Affix>
    <Modal
      title="Contact Us"
      visible={modalVisible}
      onOk={() => setModalVisible(false)}
      onCancel={() => setModalVisible(false)}
      footer={null}
      destroyOnClose={true}
      // centered={true}
      maskClosable={false}
    >
      <ContactForm onDone={() => setModalVisible(false)}></ContactForm>
    </Modal>
  </>
}