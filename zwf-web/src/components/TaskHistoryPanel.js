import { Skeleton, Space, Steps, Timeline } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { getTaskHistory$ } from 'services/taskService';
import styled from 'styled-components';
import { finalize } from 'rxjs/operators';
import { TimeAgo } from './TimeAgo';
import { UserNameCard } from './UserNameCard';

const Container = styled.div`

`;

export const TaskHistoryPanel = React.memo((props) => {
  const { taskId } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const sub$ = getTaskHistory$(taskId).pipe(
      finalize(() => setLoading(false))
    ).subscribe(setList);
    return () => sub$.unsubscribe()
  }, [taskId]);

  if (loading) {
    return <Skeleton active />
  }

  return <Container>
    <Timeline mode="left">
      {list.map(x => <Timeline.Item key={x.id} label={<TimeAgo value={x.createdAt} direction="horizontal" accurate={false}/>}>
        {x.action}
        {/* <UserNameCard userId={x.userId} /> */}
      </Timeline.Item>)}
    </Timeline>
  </Container>
});

TaskHistoryPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskHistoryPanel.defaultProps = {
};

