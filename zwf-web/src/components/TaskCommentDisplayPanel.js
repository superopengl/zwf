import PropTypes from 'prop-types';
import React from 'react';
import ScrollToBottom, { } from 'react-scroll-to-bottom';
import { listTaskComment$, } from 'services/taskService';
import * as moment from 'moment';
import { css } from '@emotion/css'
import { useAuthUser } from 'hooks/useAuthUser';
import { useZevent } from 'hooks/useZevent';
import { ackTaskEventType$ } from 'services/notificationService';
import { finalize, switchMap, tap } from 'rxjs';
import { TaskCommentList } from './TaskCommentList';


const containerCss = css({
  height: '100%',
  width: '100%',
  '& button': {
    // display: 'none',
  }
});

export const TaskCommentDisplayPanel = React.memo((props) => {
  const { taskId } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [user] = useAuthUser();

  const myUserId = user?.id;

  // React.useEffect(() => {
  //   scrollToBottom();
  // }, [list]);

  const handleZevent = z => {
    const event = z.payload;
    event.createdAt = moment.utc(event.createdAt).local().toDate();
    setList(list => [...list, event]);
  };

  const filterZevent = z => {
    return z.type === 'taskEvent' &&
      z.payload.taskId === taskId &&
      z.payload.type === 'task-comment';
  }

  useZevent(filterZevent, handleZevent);

  React.useEffect(() => {
    const sub$ = listTaskComment$(taskId)
      .pipe(
        tap(setList),
        switchMap(() => ackTaskEventType$(taskId, 'task-comment')),
        finalize(() => setLoading(false)),
      )
      .subscribe();



    return () => sub$.unsubscribe();
  }, []);

  return <ScrollToBottom className={containerCss} debug={false}>
    <TaskCommentList dataSource={list} loading={loading} />
  </ScrollToBottom >
});

TaskCommentDisplayPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskCommentDisplayPanel.defaultProps = {
};

