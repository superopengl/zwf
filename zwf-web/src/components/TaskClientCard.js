import { Space, Card, Typography, Descriptions, Row, Col, Divider } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { TimeAgo } from './TimeAgo';
import { TaskStatusTag } from './TaskStatusTag';
import { ClientIcon, DemplateIcon, TaskIcon, FemplateIcon } from './entityIcon';
import { HighlightingText } from './HighlightingText';

const { Link: TextLink, Paragraph, Text, Title } = Typography;

const StyledCard = styled(Card)`
position: relative;
box-shadow: 0 1px 2px rgba(0,0,0,0.1);
.ant-card-body {
  // padding: 16px;
}

&.unread {
  background-color: rgb(255,255,220);
  font-weight: 600;
}
`;

export const TaskClientCard = React.memo(props => {

  const { task, searchText } = props;
  const { id, name, description, orgName, createdAt, updatedAt, tags, status } = task;
  const navigate = useNavigate();

  const goToTask = (e, id) => {
    e.stopPropagation();
    navigate(`/task/${id}`);
  }

  return <StyledCard
    title={<HighlightingText value={name} search={searchText} />}
    size="large"
    hoverable={true}
    onClick={e => goToTask(e, id)}
    extra={<TaskStatusTag status={status} />}
  // className={lastUnreadMessageAt ? 'unread' : ''}
  >
    <Space direction="vertical" style={{ width: '100%' }}>
      <Text type="secondary">issued by <strong>{orgName}</strong></Text>
      <Paragraph>{description}</Paragraph>
      <Space size="middle">
        <TimeAgo key="0" prefix="Created" value={createdAt} direction="horizontal" showTime={false} />
        <TimeAgo key="1" prefix="Updated" value={updatedAt} direction="horizontal" showTime={false} />
      </Space>
    </Space>
    {/* <pre>{JSON.stringify(task, null, 2)}</pre> */}
  </StyledCard>
});

TaskClientCard.propTypes = {
  task: PropTypes.any.isRequired,
  searchText: PropTypes.string,
};

TaskClientCard.defaultProps = {};
