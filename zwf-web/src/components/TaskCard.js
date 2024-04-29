import { Space, Card, Typography, Tooltip, Grid } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { UnreadMessageIcon } from './UnreadMessageIcon';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import { TagSelect } from './TagSelect';
import {HighlightingText} from 'components/HighlightingText';
import { UserNameCard } from './UserNameCard';

const { Link: TextLink } = Typography;

const { useBreakpoint } = Grid;

const StyledCard = styled(Card)`
position: relative;
box-shadow: 0 1px 2px rgba(0,0,0,0.1);
.ant-card-body {
  padding: 16px;
}

&.unread {
  background-color: rgb(255,255,220);
  font-weight: 600;
}
`;

export const TaskCard = (props) => {

  const { task, searchText } = props;
  const { id, name, lastUnreadMessageAt, tags } = task;
  const navigate = useNavigate();

  const goToTask = (e, id) => {
    e.stopPropagation();
    navigate(`/task/${id}`);
  }
  const tagIds = React.useMemo(() => tags.map(t => t.id), [tags]);

  return <StyledCard
    title={<Tooltip title={name} placement="bottom"><HighlightingText value={name} search={searchText}></HighlightingText></Tooltip>}
    extra={<TextLink onClick={e => goToTask(e, id)}><Icon component={() => <MdOpenInNew />} /></TextLink>}
    size="small"
    hoverable
    onClick={() => navigate(`/task/${id}`)}
    className={lastUnreadMessageAt ? 'unread' : ''}
  >
    <Space direction='vertical' size="middle" style={{width: '100%'}}>
      {lastUnreadMessageAt && <UnreadMessageIcon style={{ position: 'absolute', right: 16, top: 16 }} />}
      {/* <Paragraph type="secondary" style={{lineHeight: 0.8}}><small>{taskTemplateName}</small></Paragraph> */}
      <UserNameCard userId={task.userId} size={40} showTooltip={true}/>
      {/* <pre>{JSON.stringify(task, null, 2)}</pre> */}
      {tagIds.length > 0 && <TagSelect readonly={true} value={tagIds} />}
    </Space>

  </StyledCard>
};

TaskCard.propTypes = {
  task: PropTypes.any.isRequired,
  searchText: PropTypes.string,
};

TaskCard.defaultProps = {};
