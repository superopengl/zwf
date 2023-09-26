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
import { TaskDocName } from 'components/TaskDocName';

const { Text } = Typography;

const StyledList = styled(List)`
.ant-list-item {
  border: none;
  padding: 8px 0;
}

padding-left: 16px;
padding-right: 16px;

`;

const renderItemContent = (talk) => {
  const { type, text, doc, form } = talk;

  switch (type) {
    case 'text':
      return text;
    case 'doc':
      return <TaskDocName taskDoc={doc} />
    case 'form':
      return <p>A from</p>
    default:
      return `Unknown type ${type}`;
  }
}

const ThreadItem = React.memo(props => {
  const { talk } = props;
  const { by: userId, type, text, doc, form, createdAt } = talk;
  const [user] = useAuthUser();
  const currentUserId = user?.id;
  const isMe = userId === currentUserId;

  return <Space.Compact style={{ flexDirection: isMe ? 'row-reverse' : 'column', alignItems: 'flex-start', width: '100%', gap: isMe ? 8 : 0 }} size="small">
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
        {renderItemContent(talk)}
      </Card>
      <Text type="secondary">
        <small><TimeAgo value={createdAt} accurate={false} showTime={false} /></small>
      </Text>
    </div>
  </Space.Compact>
});

export const TaskTalkList = React.memo((props) => {
  const { dataSource, loading } = props;
  return <StyledList
    loading={loading}
    dataSource={dataSource}
    locale={{ emptyText: 'No messages' }}
    renderItem={item => <List.Item>
      <ThreadItem userId={item.by} type={item.type} createdAt={item.createdAt} talk={item} />
    </List.Item>} />
});

TaskTalkList.propTypes = {
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
};

TaskTalkList.defaultProps = {
};