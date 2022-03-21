import React from 'react';
import { Affix, Space, Button, Card, Typography } from 'antd';
import { AiOutlineDown } from "react-icons/ai";
import { MdMessage } from 'react-icons/md';
import styled from 'styled-components';
import { listMyContact$, subscribeContactChange } from 'services/contactService';
import { finalize } from 'rxjs/operators';
import { ContactMessageList } from './ContactMessageList';
import { ContactMessageInput } from './ContactMessageInput';
import { sendContact$ } from 'services/contactService';
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
// background-color: #37AFD2;
width: 400px;
// max-height: calc(100vh - 400px);

.ant-card-head-title {
  font-weight: normal !important;
}
`;

export const ContactAffix = () => {
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const context = React.useContext(GlobalContext);

  const { email, givenName, surname } = context.user?.profile ?? {};
  const cheerName = `Hi ${getUserDisplayName(email, givenName, surname)}`.trim();

  React.useEffect(() => {
    const eventSource = subscribeContactChange();
    eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data);
      setList(list => {
        return [...(list ?? []), event]
      });
    }

    return () => {
      eventSource?.close();
    }
  }, []);

  React.useEffect(() => {
    if (!visible) {
      setLoading(false)
      return;
    }
    const sub$ = listMyContact$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(setList);

    return () => sub$.unsubscribe()
  }, [visible]);

  const handleSubmitMessage = (message) => {
    const capturedUrl = window.location.href;
    return sendContact$(message, capturedUrl);
  }

  return <>
    <Affix style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 3000 }}>
      <Space direction="vertical" style={{ alignItems: 'flex-end' }} size="large" >
        {visible &&
          <StyledCard
            title={<>
              <Title>{cheerName} 👋</Title>
              <Paragraph type="secondary">
                Ask us anything, or share your feedback.
              </Paragraph>
            </>}
            headStyle={{ backgroundColor: '#37AFD2' }}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{height: 'calc(100vh - 600px)', minHeight: 200}}>
            <ContactMessageList dataSource={list} loading={loading} />
            </div>
            <hr/>
            <ContactMessageInput loading={loading} onSubmit={handleSubmitMessage} />


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
