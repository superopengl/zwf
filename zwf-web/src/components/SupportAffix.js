import React from 'react';
import { Affix, Space, Button, Card, Typography, Badge } from 'antd';
import { AiOutlineDown } from "react-icons/ai";
import { MdMessage } from 'react-icons/md';
import styled from 'styled-components';
import { getMySupport$, subscribeSupportMessage, nudgeMyLastReadSupportMessage$ } from 'services/supportService';
import { finalize, catchError } from 'rxjs/operators';
import { SupportMessageList } from './SupportMessageList';
import { SupportMessageInput } from './SupportMessageInput';
import { sendContact$ } from 'services/supportService';
import { GlobalContext } from 'contexts/GlobalContext';
import { getUserDisplayName } from 'util/getUserDisplayName';

const { Paragraph, Title } = Typography;


const AffixContactButton = styled(Button)`
width: 48px;
height: 48px;
display: flex;
border-radius: 12px;
align-items: center;
justify-content: center;
border: none;
background-color:  #37AFD2bb;
color: white;
// box-shadow: 1px 1px 5px #222222;
box-shadow: 0 5px 10px rgba(0,0,0,0.3);
// border: 1px solid white;

&:focus,&:hover,&:active {
color: white;
background-color: #37AFD2;
// border: 1px solid white;
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

export const SupportAffix = () => {
  const [visible, setVisible] = React.useState(false);
  const visibleRef = React.useRef(visible);
  const [loading, setLoading] = React.useState(true);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [list, setList] = React.useState([]);
  const context = React.useContext(GlobalContext);

  const { givenName, surname } = context.user?.profile ?? {};
  const name = `${givenName || ''} ${surname || ''}`.trim();
  const cheerName = `Hi ${name || 'there'}`.trim();

  // Eventsource subscription
  React.useEffect(() => {
    const eventSource = subscribeSupportMessage();
    eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data);
      setList(list => {
        return [...(list ?? []), event]
      });
      // Has to use a ref to get the latest value of visible,
      // because it's closured by the onmessage callback function.
      if (!visibleRef.current) {
        setUnreadCount(x => x + 1);
      }
    }

    return () => {
      eventSource?.close();
    }
  }, []);

  // Initial data load
  React.useEffect(() => {
    const sub$ = getMySupport$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(resp => {
      const {list, unreadCount} = resp;
      setList(list);
      setUnreadCount(unreadCount);
    });

    return () => sub$.unsubscribe()
  }, []);

  React.useEffect(() => {
    if(visible && list?.length) {
      const lastMessage = list[list.length - 1];
      const {id} = lastMessage;
      nudgeMyLastReadSupportMessage$(id).pipe(
        catchError()
      ).subscribe();
    }
  }, [list, visible]);

  React.useEffect(() => {
    if (visible) {
      setUnreadCount(0);
    }
    visibleRef.current = visible;
  }, [visible])

  const handleSubmitMessage = (message) => {
    const capturedUrl = window.location.href;
    return sendContact$(message, capturedUrl);
  }

  return <>
    <Affix style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 900 }}>
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
            <div style={{ height: '50vh', minHeight: 200, maxHeight: 600 }}>
              <SupportMessageList dataSource={list} loading={loading} />
            </div>
            <hr />
            <SupportMessageInput loading={loading} onSubmit={handleSubmitMessage} />
          </StyledCard>}
        <Badge count={unreadCount} showZero={false}>
          <AffixContactButton type="primary" size="large" onClick={() => setVisible(x => !x)}>
            {visible ? <AiOutlineDown size={24} /> : <MdMessage size={24} />}
          </AffixContactButton>
        </Badge>
      </Space>
    </Affix>
  </>
}

SupportAffix.propTypes = {
};

SupportAffix.defaultProps = {
};
