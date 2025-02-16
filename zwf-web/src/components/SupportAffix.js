import React from 'react';
import { Affix, Space, Button, Card, Typography, FloatButton } from 'antd';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import styled from 'styled-components';
import { getMySupport$, subscribeSupportMessage, nudgeMyLastReadSupportMessage$ } from 'services/supportService';
import { finalize, catchError } from 'rxjs/operators';
import { SupportMessageList } from './SupportMessageList';
import { SupportMessageInput } from './SupportMessageInput';
import { sendContact$ } from 'services/supportService';
import { CloseOutlined, CommentOutlined, CustomerServiceOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useAuthUser } from 'hooks/useAuthUser';


const { Paragraph, Title } = Typography;


const StyledCard = styled(Card)`
box-shadow: 0 5px 10px rgba(0,0,0,0.3);
border-radius: 4px;
// background-color: #0FBFC4;
width: 400px;
// max-height: calc(100vh - 400px);

.ant-card-head-title {
  font-weight: normal !important;
}
`;

export const SupportAffix = () => {
  const [visible, setVisible] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const visibleRef = React.useRef(visible);
  const [loading, setLoading] = React.useState(true);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [list, setList] = React.useState([]);

  const [user] = useAuthUser();

  const cheerName = user?.givenName?.trim() || 'Hi There';

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
      const { list, unreadCount } = resp;
      setList(list);
      setUnreadCount(unreadCount);
    });

    return () => sub$.unsubscribe()
  }, []);

  React.useEffect(() => {
    if (visible && list?.length) {
      const lastMessage = list[list.length - 1];
      const { id } = lastMessage;
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

  const handleShowChat = () => {
    setChatOpen(true)
    setOpen(false);
  }

  const handleFloatButtonOpenChange = open => {
    setOpen(open);
  }

  return <>
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{ right: 30, bottom: 30 }}
      icon={<CustomerServiceOutlined />}
      open={open}
      onOpenChange={handleFloatButtonOpenChange}
    >
      <FloatButton
        tooltip="Terms and Conditions"
        icon={<QuestionCircleOutlined />}
        href="/terms_and_conditions"
        target="_blank"
      />
      <FloatButton
        tooltip="Privacy Policy"
        icon={<MdOutlinePrivacyTip />}
        href="/privacy_policy"
        target="_blank"
      />
      <FloatButton
        icon={<CommentOutlined />}
        tooltip="Chat with ZeeWorkflow support"
        onClick={handleShowChat}
      />
    </FloatButton.Group>

    {chatOpen && <Affix style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 900 }}>
      <Space direction="vertical" style={{ alignItems: 'flex-end' }} size="large" >
        <StyledCard
          title={<>
            <Title>👋 {cheerName}</Title>
            <Paragraph type="secondary" style={{ color: '#FFFFFF' }}>
              Ask us anything, or share your feedback.
            </Paragraph>
          </>}
          extra={<Button icon={<CloseOutlined />} onClick={() => setChatOpen(false)} type="text" />}
          headStyle={{ backgroundColor: '#0FBFC4' }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ height: '50vh', minHeight: 200, maxHeight: 600 }}>
            <SupportMessageList dataSource={list} loading={loading} />
          </div>
          <hr />
          <SupportMessageInput loading={loading} onSubmit={handleSubmitMessage} />
        </StyledCard>
        {/* <Badge count={unreadCount} showZero={false}>
          <AffixContactButton type="primary" size="large" onClick={() => setVisible(x => !x)}>
            <AiOutlineDown size={24} />
          </AffixContactButton>
        </Badge> */}
      </Space>
    </Affix>}
  </>
}

SupportAffix.propTypes = {
};

SupportAffix.defaultProps = {
};
