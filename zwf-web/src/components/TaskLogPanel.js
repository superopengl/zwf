import { Skeleton, Space, Typography, Timeline } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { getTaskLog$ } from 'services/taskService';
import styled from 'styled-components';
import { finalize } from 'rxjs/operators';
import { TimeAgo } from './TimeAgo';
import { UserNameCard } from './UserNameCard';

const {Text} = Typography

const Container = styled.div`
.capitalized {
  text-transform: capitalize;
}
`;

export const TaskLogPanel = React.memo((props) => {
  const { taskId } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const sub$ = getTaskLog$(taskId).pipe(
      finalize(() => setLoading(false))
    ).subscribe(setList);
    return () => sub$.unsubscribe()
  }, [taskId]);

  if (loading) {
    return <Skeleton active />
  }

  return <Container>
    <Timeline
      items={list.map(x => ({
        children: <Space direction='vertical'>
          <TimeAgo value={x.createdAt} direction="horizontal" accurate={false} showTime={false}/>
          <Text strong className="capitalized">{x.type}</Text>
          <UserNameCard userId={x.by} />
        </Space>
      }))}
    />
  </Container>
});

TaskLogPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskLogPanel.defaultProps = {
};

