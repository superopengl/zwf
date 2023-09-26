import PropTypes from 'prop-types';
import React from 'react';
import ScrollToBottom, { } from 'react-scroll-to-bottom';
import { getTaskTalk$ } from 'services/taskService';
import { css } from '@emotion/css'
import { ackTaskEventType$ } from 'services/zeventService';
import { filter, finalize, switchMap, map, tap } from 'rxjs';
import { TaskTalkList } from './TaskTalkList';
import { ZeventContext } from 'contexts/ZeventContext';
import { useScrollToBottom, useSticky } from 'react-scroll-to-bottom';


const containerCss = css({
  height: '100%',
  width: '100%',
  '& button': {
    // display: 'none',
  }
});

export const TaskTalkDisplayPanel = React.memo((props) => {
  const { taskId } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const { onNewZevent$ } = React.useContext(ZeventContext);
  const scrollToBottom = useScrollToBottom();

  React.useEffect(() => {
    scrollToBottom();
  }, [list]);

  React.useEffect(() => {
    const sub$ = getTaskTalk$(taskId)
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
      filter(z => z.type === 'taskTalk'),
      filter(z => z.payload.taskId === taskId),
      map(z => z.payload),
      tap(e => setList(list => [...list, e])),
    ).subscribe();

    return () => sub$.unsubscribe();
  }, []);

  return <ScrollToBottom className={containerCss} debug={false}>
    <TaskTalkList dataSource={list} loading={loading} />
  </ScrollToBottom >
});

TaskTalkDisplayPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskTalkDisplayPanel.defaultProps = {
};

