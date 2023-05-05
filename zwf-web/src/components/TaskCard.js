import { Typography, Tooltip, Row, Col, Space } from 'antd';
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
import { ClientNameCard } from './ClientNameCard';
import dayjs from 'dayjs';
import { TaskBoardContext } from 'contexts/TaskBoardContext';

const { Text, Link: TextLink } = Typography;

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

.task-title {
  font-weight: 500;
}
`;

export const TaskCard = (props) => {

  const { task, searchText } = props;
  const { id, name, tags } = task;
  const [user] = useAuthUser();
  const { showClient, showTags } = React.useContext(TaskBoardContext);
  const navigate = useNavigate();

  const tagIds = React.useMemo(() => (tags ?? []).map(t => t.id), [tags]);

  return <StyledCard gutter={[20, 20]}
    direction="row"
    split='horizontal'
    bordered
    headStyle={{ padding: '16px 16px 0' }}
    style={{ borderLeftColor: task.assigneeId === user.id ? '#0FBFC4' : 'transparent' }}
    hoverable
    onClick={() => navigate(`/task/${id}`)}
  >
    <ProCard>
      <Row gutter={[10, 10]} justify="space-between" align="top" style={{ marginBottom: 16 }} wrap={false}>
        <Col flex="auto">
          <Tooltip title={name} placement="bottom">
            <Text ellipsis className='task-title'>
              <HighlightingText value={name} search={searchText}></HighlightingText>
            </Text>
          </Tooltip>
        </Col>
        <Col>
          <TextLink onClick={e => e.stopPropagation()} href={`/task/${id}`} target="_blank"><Icon component={MdOpenInNew} /></TextLink>
        </Col>
      </Row>
      <Row gutter={[10, 10]} justify="space-between">
        {showClient && <Col>
          <ClientNameCard id={task.orgClientId} />
        </Col>}
        <Col>
          <Space align="top">
            Updated
            <TimeAgo value={task.updatedAt} />
          </Space>
        </Col>
      </Row>
    </ProCard>

    {(tagIds.length > 0 || task.assigneeId) &&
      <ProCard>
        <Row gutter={[10, 10]} justify="space-between">
          {showTags && <Col span={24}>
            <TagSelect readonly={true} value={tagIds} />
          </Col>}
          {task.dueAt && <>
            <Col>
              <Space align='top'>
                Due
                <TimeAgo value={task.dueAt} accurate={false} />
              </Space>
            </Col>
          </>}
          {(task.estNumber && task.estUnit) && <>
            <Col>
              <Space align='top'>
                EST.
                <Text>{task.estNumber} {task.estUnit}</Text>
              </Space>
            </Col>
          </>}
          {task.assigneeId && <Col>
            <UserNameCard userId={task.assigneeId} size={40} showTooltip={true} showName={false} showEmail={false} />
          </Col>}

        </Row>
      </ProCard>}
  </StyledCard>
};

TaskCard.propTypes = {
  task: PropTypes.any.isRequired,
  searchText: PropTypes.string,
};

TaskCard.defaultProps = {};
