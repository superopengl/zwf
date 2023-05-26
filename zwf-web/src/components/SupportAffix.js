import React from 'react';
import { Affix, Space, Button, Card, Typography, FloatButton } from 'antd';
import { MdOutlinePrivacyTip } from 'react-icons/md';
import styled from 'styled-components';
import { listMySupportMessages$, nudgeMyLastReadSupportMessage$ } from 'services/supportService';
import { finalize, catchError, filter, tap, switchMap } from 'rxjs/operators';
import { SupportMessageList } from './SupportMessageList';
import { SupportMessageInput } from './SupportMessageInput';
import { sendSupportMessage$ } from 'services/supportService';
import { CloseOutlined, CommentOutlined, CustomerServiceOutlined, DownOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useAuthUser } from 'hooks/useAuthUser';
import { ZeventBadge } from './ZeventBadge';
import { ZeventContext } from 'contexts/ZeventContext';
import { Badge } from 'antd';


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
  const [loading, setLoading] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [user] = useAuthUser();
  const { onNewZevent$ } = React.useContext(ZeventContext);


  // Initial data load

  React.useEffect(() => {
    const sub$ = listMySupportMessages$().subscribe(setList);
    return () => sub$.unsubscribe()
  }, []);


  React.useEffect(() => {
    if (chatOpen) {
      setLoading(true)
      const sub$  = nudgeMyLastReadSupportMessage$()
        .pipe(
          switchMap(() =>  listMySupportMessages$()),
          finalize(() => setLoading(false))
        ).subscribe(setList);

      return () => sub$.unsubscribe()
    }
  }, [chatOpen]);

  React.useEffect(() => {
    setUnreadCount(list.filter(x => x.by !== user.id && !x.userLastSeenAt).length);
  }, [list]);

  React.useEffect(() => {
    const sub$ = onNewZevent$().pipe(
      filter(z => z.type === 'support')
    ).subscribe(z => {
      setList(pre => [...pre, z.payload]);
    });

    return () => sub$.unsubscribe()
  }, []);

  const handleSubmitMessage = (message) => {
    const capturedUrl = window.location.href;
    return sendSupportMessage$(message, capturedUrl);
  }

  const handleShowChat = () => {
    setChatOpen(true)
    setMenuOpen(false);
  }


  return <>
    {
      chatOpen ? <Affix style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 900 }}>
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
            extra={<Button icon={<DownOutlined />} onClick={() => setChatOpen(false)} type="text" />}
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
      </Affix> :
        <FloatButton
          // type="primary"
          style={{ right: 30, bottom: 30 }}
          icon={<CustomerServiceOutlined />}
          tooltip="Chat with ZeeWorkflow support"
          onClick={handleShowChat}
          badge={{
            showZero: false,
            count: unreadCount,
          }}
        />
    }
  </>
}

SupportAffix.propTypes = {
};

SupportAffix.defaultProps = {
};
