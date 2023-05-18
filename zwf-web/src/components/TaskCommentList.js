import React from 'react';
import { List, Typography, Space, Card } from 'antd';
import ScrollToBottom from 'react-scroll-to-bottom';
import styled from 'styled-components';
import { css } from '@emotion/css'
import PropTypes from 'prop-types';
import { TimeAgo } from './TimeAgo';
import { RawHtmlDisplay } from './RawHtmlDisplay';
import { useAuthUser } from 'hooks/useAuthUser';
import { DebugJsonPanel } from './DebugJsonPanel';
import { UserNameCard } from './UserNameCard';

const { Text } = Typography;

const StyledList = styled(List)`
.ant-list-item {
  border: none;
  padding-left: 0;
  padding-right: 0;
}

padding-left: 16px;
padding-right: 16px;

`;

const ChatMessage = React.memo(props => {
  const { userId, message, createdAt } = props;
  const [user] = useAuthUser();
  const currentUserId = user?.id;
  const isMe = userId === currentUserId;

  return <Space style={{ flexDirection: isMe ? 'row-reverse' : 'column', alignItems: 'flex-start', width: '100%', gap: isMe ? 8 : 0 }} size="small">
    <UserNameCard userId={userId} showName={!isMe} showEmail={false} />
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', paddingLeft: isMe ? 0 : 42 }}>
      <Card
        size="small"
        bordered={true}
        bodyStyle={{
          padding: 10,
          maxWidth: 600,
          lineBreak: 'anywhere'
        }}
        style={{
          // marginLeft: 40,
          // marginBottom: 4,
          // color: isMe ? '#FFFFFFcc !important' : 'normal',
          backgroundColor: isMe ? '#0FBFC499' : 'rgb(236, 236, 236)',
          borderRadius: 12,
        }}>
        {message}
      </Card>
      <Text type="secondary">
        <small><TimeAgo value={createdAt} accurate={false} showTime={false} /></small>
      </Text>
    </div>
  </Space>
});

export const TaskCommentList = React.memo((props) => {
  const { dataSource, loading } = props;
  return <StyledList
    loading={loading}
    dataSource={dataSource}
    locale={{ emptyText: 'No messages' }}
    renderItem={item => <List.Item>
      <ChatMessage userId={item.by} message={item.info.message} createdAt={item.createdAt} />
    </List.Item>} />
});

TaskCommentList.propTypes = {
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
};

TaskCommentList.defaultProps = {
};