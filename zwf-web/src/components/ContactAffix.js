import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Affix, Space, Button, Card, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import ContactForm from 'components/ContactForm';
import { AiOutlineMessage, AiOutlineDown } from "react-icons/ai";
import { MdMessage } from 'react-icons/md';
import styled from 'styled-components';
import { GlobalContext } from 'contexts/GlobalContext';
import { getUserDisplayName } from 'util/getUserDisplayName';

const { Paragraph, Title } = Typography;

const AffixContactButton = styled(Button)`
width: 48px;
height: 48px;
display: flex;
align-items: center;
justify-content: center;
border: none;
background-color:  #37AFD2bb;
color: white;
// box-shadow: 1px 1px 5px #222222;
box-shadow: 0 5px 10px rgba(0,0,0,0.3);
border: 1px solid white;

&:focus,&:hover,&:active {
color: white;
background-color: #37AFD2;
border: 1px solid white;
}
`;

const StyledCard = styled(Card)`
box-shadow: 0 5px 10px rgba(0,0,0,0.3);
border-radius: 16px;
background-color: #37AFD2;
`;


export const ContactAffix = () => {
  const [visible, setVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);

  const { email, givenName, surname } = context.user?.profile ?? {};
  const cheerName = `Hi ${getUserDisplayName(email, givenName, surname)}`.trim();

  return <>
    <Affix style={{ position: 'fixed', bottom: 30, right: 30 }}>
      <Space direction="vertical" style={{ alignItems: 'flex-end' }} size="large" >
        {visible && <StyledCard
          title={null}
          style={{ width: 400, height: 500 }}
        >
          <Title>{cheerName} 👋</Title>
          <Paragraph type="secondary">
            Ask us anything, or share your feedback.
          </Paragraph>
          <ContactForm onDone={() => setVisible(false)}></ContactForm>
        </StyledCard>}
        <AffixContactButton type="primary" shape="circle" size="large" onClick={() => setVisible(x => !x)}>
          {visible ? <AiOutlineDown size={24} /> : <MdMessage size={24} />}
        </AffixContactButton>
      </Space>
    </Affix>
  </>
}

ContactAffix.propTypes = {
};

ContactAffix.defaultProps = {
};
