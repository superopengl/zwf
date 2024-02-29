import React from 'react';
import { List, Typography, Space, Card } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import ScrollToBottom from 'react-scroll-to-bottom';
import styled from 'styled-components';
import { css } from '@emotion/css'
import PropTypes from 'prop-types';
import { TimeAgo } from './TimeAgo';

const { Paragraph, Title, Text } = Typography;

const containerCss = css({
  height: '100%',
  width: '100%',
  '& button': {
    display: 'none',
  }
});

const StyledList = styled(List)`
.ant-list-item {
  border: none;
}

padding-left: 16px;
padding-right: 16px;

`;

const ChatMessage = React.memo(props => {
  const { userId, message, createdAt } = props;
  const context = React.useContext(GlobalContext);
  const currentUserId = context.user.id;
  const isMe = userId === currentUserId;

  return <Space style={{ flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start', width: '100%' }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
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
          // color: isMe ? '#000000cc !important' : 'normal',
          backgroundColor: isMe ? '#37AFD2aa' : 'rgb(236, 236, 236)',
          borderRadius: 12
        }}>
        {message}
      </Card>
      <Text type="secondary">
        <TimeAgo value={createdAt} accurate={false} showTime={false} />
      </Text>
    </div>
  </Space>
});

export const SupportMessageList = React.memo((props) => {
  const { dataSource, loading } = props;
  return <ScrollToBottom className={containerCss} debug={false}>
      <StyledList
        loading={loading}
        dataSource={dataSource}
        renderItem={item => <List.Item>
          <ChatMessage userId={item.by} message={item.message} createdAt={item.createdAt} />
        </List.Item>} />
    </ScrollToBottom>
});

SupportMessageList.propTypes = {
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
};

SupportMessageList.defaultProps = {
};