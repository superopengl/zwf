import { MessageFilled } from '@ant-design/icons';
import { Timeline, Space, Typography, Card, Skeleton } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import PropTypes from 'prop-types';
import React from 'react';
import { TimeAgo } from './TimeAgo';
import { UserNameCard } from './UserNameCard';
import ScrollToBottom, { useScrollToBottom, useSticky } from 'react-scroll-to-bottom';
import { listTaskComment$, } from 'services/taskService';
import { nudgeTrackingAccess$ } from 'services/taskTrackingService';
import { subscribeTaskTracking } from "services/taskTrackingService";
import * as moment from 'moment';
import { css } from '@emotion/css'
import { TaskTrackingTimeline } from './TaskTrackingTimeline';
import { Loading } from './Loading';
const containerCss = css({
  height: '100%',
  width: '100%',
  '& button': {
    display: 'none',
  }
});


export const TaskCommentPanel = React.memo((props) => {
  const { taskId } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // React.useEffect(() => {
  //   scrollToBottom();
  // }, [list]);

  React.useEffect(() => {
    const sub$ = listTaskComment$(taskId).subscribe(allData => {
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
      nudgeTrackingAccess$(taskId).subscribe();
    }

    return () => {
      sub$?.unsubscribe();
      eventSource?.close();
    }
  }, []);

  return <ScrollToBottom className={containerCss} debug={false}>
    <TaskTrackingTimeline dataSource={list} />
  </ScrollToBottom >
});

TaskCommentPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskCommentPanel.defaultProps = {
};

