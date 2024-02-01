import { MessageFilled } from '@ant-design/icons';
import { Timeline, Space, Typography, Card } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import PropTypes from 'prop-types';
import React from 'react';
import { TimeAgo } from './TimeAgo';
import { UserNameCard } from './UserNameCard';
import ScrollToBottom, { useScrollToBottom } from 'react-scroll-to-bottom';
import { css } from '@emotion/css'
const containerCss = css({
  height: '100%',
  width: '100%',
  '& button': {
    display: 'none',
  }
});

const { Text , Paragraph} = Typography

const ChatMessage = props => {
  const { userId, message } = props;
  const context = React.useContext(GlobalContext);
  const isMe = userId === context.user.id;

  return  <Space style={{flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start', width: '100%' }}>
    <strong><UserNameCard userId={userId} showName={false} showEmail={false} showTooltip={true} /></strong>
    <Card
      size="small"
      bordered={true}
      bodyStyle={{
        padding: 10,
      }}
      style={{
        // marginLeft: 40,
        // marginBottom: 4,
        backgroundColor: isMe ? '#13c2c2' : 'rgb(236, 236, 236)',
      }}>
      {message}
      </Card>
  </Space>

}

export const TaskTrackingPanel = React.memo((props) => {
  const { dataSource } = props;

  const context = React.useContext(GlobalContext);
  const currentUserId = context.user.id;

  // React.useEffect(() => {
  //   scrollToBottom();
  // }, [dataSource]);

  return <ScrollToBottom className={containerCss}>
    <Timeline mode="left" style={{ padding: 16, paddingLeft: 20 }}>
      {(dataSource ?? []).map(item => <Timeline.Item
        key={item.id}
        color={item.action === 'chat' ? (item.by === currentUserId ? 'blue' : 'gray') : 'blue'}
        // position={item.action === 'chat' && item.by === currentUserId ? 'left' : 'right'}
        dot={item.action === 'chat' ? <MessageFilled /> : null}
      // label={screens.md ? <TimeAgo value={item.createdAt} accurate={false} direction="horizontal" /> : null}
      >
        <Space direction="vertical" size="small" style={{width: '100%'}}>
          <TimeAgo value={item.createdAt} accurate={true} direction="horizontal" />
          {item.action === 'chat' ? <ChatMessage userId={item.by} message={item.info} /> : <Text>{item.action ?? item.info}</Text>}
        </Space>
      </Timeline.Item>
      )}
    </Timeline>
  </ScrollToBottom>
});

TaskTrackingPanel.propTypes = {
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
};

TaskTrackingPanel.defaultProps = {
  dataSource: []
};

