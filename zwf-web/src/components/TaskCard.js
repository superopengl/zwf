import { Space, Card, Typography, Tooltip, Grid, Avatar } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import { TagSelect } from './TagSelect';
import { HighlightingText } from 'components/HighlightingText';
import { UserNameCard } from './UserNameCard';
import { TimeAgo } from './TimeAgo';
import { ProCard } from '@ant-design/pro-components';
import { useAuthUser } from 'hooks/useAuthUser';

const { Link: TextLink } = Typography;

const { useBreakpoint } = Grid;

const StyledCard = styled(ProCard)`
position: relative;
box-shadow: 0 1px 2px rgba(0,0,0,0.1);

border-left: 2px solid transparent;

.ant-pro-card-header {
  padding: 8px;

  .ant-pro-card-title {
    font-weight: 400;
    font-size: 15px;
  }
}
.ant-pro-card-body {
  padding: 2px 8px;
}

&.unread {
  background-color: rgb(255,255,220);
  font-weight: 600;
}
`;

export const TaskCard = (props) => {

  const { task, searchText } = props;
  const { id, name, lastUnreadMessageAt, tags } = task;
  const [user] = useAuthUser();
  const navigate = useNavigate();

  const goToTask = (e, id) => {
    e.stopPropagation();
    navigate(`/task/${id}`);
  }
  const tagIds = React.useMemo(() => tags.map(t => t.id), [tags]);

  return <StyledCard gutter={[20, 20]}
    direction="row"
    split='horizontal'
    bordered
    headStyle={{ padding: '16px 16px 0' }}
    style={{borderLeftColor: task.assigneeId === user.id ? '#0FBFC4' : 'transparent'}}
    title={<Tooltip title={name} placement="bottom">
      <HighlightingText value={name} search={searchText}></HighlightingText>
    </Tooltip>}
    extra={<TextLink onClick={e => goToTask(e, id)} target="_blank"><Icon component={MdOpenInNew} /></TextLink>}
    hoverable
    onClick={() => navigate(`/task/${id}`)}
  >
    <ProCard
      title={<Avatar.Group>
        <UserNameCard userId={task.userId} size={40} showTooltip={true} showName={true} showEmail={true} />
        {/* {task.assigneeId && <UserNameCard userId={task.assigneeId} size={40} showTooltip={true} showName={false} showEmail={false} />} */}
      </Avatar.Group>}
      extra={<TimeAgo key="updatedAt" value={task.updatedAt} />}
    >
    </ProCard>

    {(tagIds.length > 0 || task.assigneeId) &&
      <ProCard
        headStyle={{paddingTop: 0, paddingBottom: 0}}
        title={<TagSelect readonly={true} value={tagIds} />}
        extra={task.assigneeId ? <UserNameCard userId={task.assigneeId} size={40} showTooltip={true} showName={false} showEmail={false} /> : null}
      >
        
      </ProCard>}
  </StyledCard>
};

TaskCard.propTypes = {
  task: PropTypes.any.isRequired,
  searchText: PropTypes.string,
};

TaskCard.defaultProps = {};
