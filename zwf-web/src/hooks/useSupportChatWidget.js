import React from 'react';
import { Affix, Space, Button, Card, Typography } from 'antd';
import styled from 'styled-components';
import { listMySupportMessages$ } from 'services/supportService';
import { finalize } from 'rxjs/operators';
import { SupportMessageList } from '../components/SupportMessageList';
import { SupportMessageInput } from '../components/SupportMessageInput';
import { sendSupportMessage$ } from 'services/supportService';
import { CloseOutlined } from '@ant-design/icons';
import { useZevent } from 'hooks/useZevent';


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

export const useSupportChatWidget = () => {

  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [list, setList] = React.useState([]);

  useZevent(z => z.type === 'support', z => {
    setList(list => [...list, z.payload])
  });

  // Initial data load
  React.useEffect(() => {
    if (open) {
      const sub$ = listMySupportMessages$()
        .pipe(
          finalize(() => setLoading(false))
        ).subscribe(list => {
          setList(list);
        });

      return () => sub$.unsubscribe()
    }
  }, [open]);

  const handleSubmitMessage = (message) => {
    const capturedUrl = window.location.href;
    return sendSupportMessage$(message, capturedUrl);
  }

  const openSupport = () => {
    setOpen(true);
  }

  const contextHolder = !open ? null : <Affix
    style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 900 }}
    // offsetBottom={300}
    target={() => window}>
    <Space direction="vertical" style={{ alignItems: 'flex-end' }} size="large" >
      <StyledCard
        // title="Contact support"
        title={<>
          <Title level={2}>Chat with support</Title>
          <Paragraph>
            Ask us anything, or share your feedback.
          </Paragraph>
        </>}
        extra={<Button icon={<CloseOutlined />} onClick={() => setOpen(false)} type="text" />}
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
  </Affix>

  return [openSupport, contextHolder, open];
}

