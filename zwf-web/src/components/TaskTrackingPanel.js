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
});

const { Text } = Typography

const ChatMessage = props => {
  const { message } = props;
  const context = React.useContext(GlobalContext);
  const userId = context.user.id;
  const isMe = userId === context.user.id;

  return <Card
    size="small"
    bordered={true}
    style={{
      marginBottom: 4,
      backgroundColor: isMe ? '#66c18c' : 'rgb(245,245,245)',
    }}>
    <Space style={{ width: '100%', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      <UserNameCard userId={userId} showName={false} showTooltip={true} />
      {message}
    </Space>
  </Card>

}

export const TaskTrackingPanel = React.memo((props) => {
  const { dataSource } = props;

  const scrollToBottom = useScrollToBottom();
  const context = React.useContext(GlobalContext);
  const currentUserId = context.user.id;

  React.useEffect(() => {
    scrollToBottom();
  }, [dataSource]);

  return <ScrollToBottom className={containerCss}>
    <Timeline mode="left" style={{paddingLeft: 4}}>
      {(dataSource ?? []).map(item => <Timeline.Item
        key={item.id}
        color={item.action === 'chat' ? (item.by === currentUserId ? 'green' : 'blue') : 'gray'}
        // position={item.action === 'chat' && item.by === currentUserId ? 'left' : 'right'}
        dot={item.action === 'chat' ? <MessageFilled /> : null}
      // label={<TimeAgo value={item.createdAt} accurate={false} direction="horizontal" />}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {item.action === 'chat' ? <ChatMessage userId={item.by} message={item.info} /> : <Text>{item.action ?? item.info}</Text>}
          <TimeAgo value={item.createdAt} accurate={false} direction="horizontal" />
        </div>
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

