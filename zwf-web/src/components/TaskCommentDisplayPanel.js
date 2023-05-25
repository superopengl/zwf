import PropTypes from 'prop-types';
import React from 'react';
import ScrollToBottom, { } from 'react-scroll-to-bottom';
import { listTaskComment$, } from 'services/taskService';
import * as moment from 'moment';
import { css } from '@emotion/css'
import { ackTaskEventType$ } from 'services/zeventService';
import { filter, finalize, switchMap, tap } from 'rxjs';
import { TaskCommentList } from './TaskCommentList';
import { ZeventContext } from 'contexts/ZeventContext';


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
  const { onNewZevent$ } = React.useContext(ZeventContext);

  // React.useEffect(() => {
  //   scrollToBottom();
  // }, [list]);

  const handleNewZevent = z => {
    const event = z.payload;
    event.createdAt = moment.utc(event.createdAt).local().toDate();
    setList(list => [...list, event]);
  };

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
  
  React.useEffect(() => {
    const sub$ = onNewZevent$().pipe(
      filter(z => z.type === 'taskEvent'),
      filter(z => z.payload.taskId === taskId),
      filter(z => z.payload.type === 'task-comment'),
      tap(z => handleNewZevent(z)),
    ).subscribe();

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

