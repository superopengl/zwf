import { MessageFilled } from '@ant-design/icons';
import { Timeline, Space, Typography, Card, Skeleton, Button } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import PropTypes from 'prop-types';
import React from 'react';
import { TimeAgo } from './TimeAgo';
import { UserNameCard } from './UserNameCard';
import ScrollToBottom, { useScrollToBottom, useSticky } from 'react-scroll-to-bottom';
import { getTask$, listTaskTrackings$, subscribeTaskTracking } from 'services/taskService';
import { uniqBy, orderBy } from 'lodash';
import * as moment from 'moment';
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
  const currentUserId = context.user.id;
  const isMe = userId === currentUserId;

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
  const { taskId } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const scrollToBottom = useScrollToBottom();
  const context = React.useContext(GlobalContext);
  const [sticky] = useSticky();
  const currentUserId = context.user.id;

  // React.useEffect(() => {
  //   scrollToBottom();
  // }, [list]);

  React.useEffect(() => {
    const sub$ = listTaskTrackings$(taskId).subscribe(allData => {
      allData.forEach(x => {
        x.createdAt = moment.utc(x.createdAt).local().toDate()
      });
      setList(allData);
      setLoading(false);
    });

    const eventSource = subscribeTaskTracking(taskId);
    eventSource.onmessage = (message) => {
      const event = JSON.parse(message.data);
      event.createdAt = moment.utc(event.createdAt).local().toDate();
      setList(list => [...list, event]);
    }

    return () => {
      sub$?.unsubscribe();
      eventSource?.close();
    }
  }, []);

  if(loading) {
    return <Skeleton active/>
  }

  return <ScrollToBottom className={containerCss} debug={false}>
    {/* {!sticky && <Button onClick={scrollToBottom}>to bottom</Button>} */}
    <Timeline mode="left" style={{ padding: 16, paddingLeft: 20 }}>
      {(list ?? []).map(item => <Timeline.Item
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
  taskId: PropTypes.string.isRequired,
};

TaskTrackingPanel.defaultProps = {
};

