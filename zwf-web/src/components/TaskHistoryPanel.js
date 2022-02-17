import { Skeleton, Space, Steps } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { getTaskHistory$ } from 'services/taskService';
import styled from 'styled-components';
import { finalize } from 'rxjs/operators';
import { UserDisplayName } from 'components/UserDisplayName';
import { UserAvatar } from 'components/UserAvatar';
import { TimeAgo } from './TimeAgo';

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

  if(loading) {
    return <Skeleton active />
  }

  return <Container>
    <Steps progressDot direction="vertical" current={list.length - 1}>
      {list.map(x => <Steps.Step
        key={x.id}
        status="wait"
        title={<>
          {x.action} <TimeAgo value={x.createdAt} direction="horizontal"/> 
        </>
        }
        description={<Space size="small">
          <UserAvatar value={x.avatarFileId} color={x.avatarColorHex} size={32} />
          <UserDisplayName
            surname={x.surname}
            givenName={x.givenName}
            email={x.email}
          />
        </Space>}>
      </Steps.Step>)}
    </Steps>
  </Container>
});

TaskHistoryPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskHistoryPanel.defaultProps = {
};

