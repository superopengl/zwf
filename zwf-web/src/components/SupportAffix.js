import React from 'react';
import { Affix, Space, Button, Card, Typography, FloatButton } from 'antd';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import styled from 'styled-components';
import { listMySupportMessages$, nudgeMyLastReadSupportMessage$ } from 'services/supportService';
import { finalize, catchError, filter, tap } from 'rxjs/operators';
import { SupportMessageList } from './SupportMessageList';
import { SupportMessageInput } from './SupportMessageInput';
import { sendSupportMessage$ } from 'services/supportService';
import { CloseOutlined, CommentOutlined, CustomerServiceOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useAuthUser } from 'hooks/useAuthUser';
import { ZeventBadge } from './ZeventBadge';
import { ZeventContext } from 'contexts/ZeventContext';


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

.ant-card-head-wrapper {
  align-items: start;

  .ant-typography {
    color: #FFFFFFDD;
  }
  .ant-card-extra {
    margin-top: 21px;
    .anticon {
      color: #FFFFFFDD;
    }
  }
}
`;

export const SupportAffix = () => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);
  const [user] = useAuthUser();
  const { onNewZevent$ } = React.useContext(ZeventContext);

  const cheerName = user?.givenName?.trim() || 'Hi There';

  // Initial data load
  React.useEffect(() => {
    if (chatOpen) {
      const sub$ = listMySupportMessages$().pipe(
        finalize(() => setLoading(false))
      ).subscribe(list => {
        setList(list);
      });

      return () => sub$.unsubscribe()
    }
  }, [chatOpen]);

  React.useEffect(() => {
    const sub$ = onNewZevent$().pipe(
      filter(z => z.type === 'support')
    ).subscribe(z => {
      setList(pre => [...pre, z.payload]);
    });

    return () => sub$.unsubscribe()
  }, []);

  React.useEffect(() => {
    if (chatOpen && list?.length) {
      nudgeMyLastReadSupportMessage$()
        .subscribe({
          error: () => { }
        });
    }
  }, [list, chatOpen]);


  const handleSubmitMessage = (message) => {
    const capturedUrl = window.location.href;
    return sendSupportMessage$(message, capturedUrl);
  }

  const handleShowChat = () => {
    setChatOpen(true)
    setMenuOpen(false);
  }

  const handleFloatButtonOpenChange = open => {
    setMenuOpen(open);
  }

  return <>
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{ right: 30, bottom: 30 }}
      icon={<CustomerServiceOutlined />}
      open={menuOpen}
      onOpenChange={handleFloatButtonOpenChange}
    >
      <ZeventBadge
        message="You have unread messages"
        filter={z => z.type === 'support'}
      >
        <FloatButton
          tooltip="Terms of Use"
          icon={<QuestionCircleOutlined />}
          href="/terms_of_use"
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
      </ZeventBadge>
    </FloatButton.Group>

    {
      chatOpen && <Affix style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 900 }}>
        {/* <DebugJsonPanel value={list} /> */}
        <Space direction="vertical" style={{ alignItems: 'flex-end' }} size="large" >
          <StyledCard
            // title="Contact support"
            title={<>
              <Title level={2}>Chat with support</Title>
              <Paragraph>
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
            {/* <DebugJsonPanel value={list } /> */}
            <SupportMessageInput loading={loading} onSubmit={handleSubmitMessage} />
          </StyledCard>
          {/* <Badge count={unreadCount} showZero={false}>
          <AffixContactButton type="primary" size="large" onClick={() => setVisible(x => !x)}>
            <AiOutlineDown size={24} />
          </AffixContactButton>
        </Badge> */}
        </Space>
      </Affix>
    }
  </>
}

SupportAffix.propTypes = {
};

SupportAffix.defaultProps = {
};
