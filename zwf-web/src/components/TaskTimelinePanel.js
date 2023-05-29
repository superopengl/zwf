import { Skeleton, Space, Typography, Timeline, Tag } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { getTaskTimeline$ } from 'services/taskService';
import styled from 'styled-components';
import { finalize } from 'rxjs/operators';
import { TimeAgo } from './TimeAgo';
import { UserNameCard } from './UserNameCard';

const { Text } = Typography

const Container = styled.div`
.capitalized {
  text-transform: capitalize;
}
`;

export const TaskTimelinePanel = React.memo((props) => {
  const { taskId } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const sub$ = getTaskTimeline$(taskId).pipe(
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
        // color: 
        children: <Space direction='vertical'>
          <TimeAgo type="default" 
          // prefix={<UserNameCard userId={x.by} showEmail={false} size={24} />} 
          value={x.createdAt} direction="horizontal" accurate={true} showTime={true} />
          <Space>
            <UserNameCard userId={x.by} showEmail={false} size={24} />
            <Tag>{x.type}</Tag>
          </Space>
            {x.type === 'comment' && <Text type="secondary">{x.info.message}</Text>}
        </Space>
      }))}
    />
  </Container>
});

TaskTimelinePanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskTimelinePanel.defaultProps = {
};

