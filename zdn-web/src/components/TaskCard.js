import { Space, Card, Modal, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import PropTypes from 'prop-types';
import { MailOutlined, MessageOutlined } from '@ant-design/icons';
import { UnreadMessageIcon } from './UnreadMessageIcon';
import { TaskIcon } from './entityIcon';
import AdminTaskModal from 'pages/MyTask/AdminTaskModal';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import TaskDetailModal from 'pages/MyTask/TaskPanel';

const { Link: TextLink } = Typography;

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

const TaskCard = (props) => {

  const { task, index } = props;
  const { id, name, forWhom, email, lastUnreadMessageAt, taskTemplateName } = task;

  const [currentTask, setCurrentTask] = React.useState();

  const getItemStyle = (isDragging, draggableStyle) => ({
    // background: isDragging ? "#C0C0C0" : "",
    ...draggableStyle
  });


  const goToTask = (e, id) => {
    e.stopPropagation();
    props.history.push(`/task/${id}`);
  }

  return <Draggable draggableId={id} index={index}>
    {
      (provided, snapshot) => (
        <div ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
          <StyledCard
            title={<><TaskIcon /> {name}</>}
            extra={<TextLink onClick={e => goToTask(e, id)}><Icon component={() => <MdOpenInNew />} /></TextLink>}
            size="small"
            hoverable
            onClick={() => setCurrentTask({taskId: id, name})}
            className={lastUnreadMessageAt ? 'unread' : ''}
          >
            {lastUnreadMessageAt && <UnreadMessageIcon style={{ position: 'absolute', right: 16, top: 16 }} />}
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary"><small>{taskTemplateName}</small></Text>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space style={{ lineHeight: '0.5rem', padding: 0 }}>
                  <PortfolioAvatar value={forWhom} id={task.portfolioId} size={32} />
                  <Space direction="vertical">
                    <small>{forWhom}</small>
                    <small>{email}</small>
                  </Space>
                </Space>
              </Space>
            </Space>
            {/* <div style={{ display: 'flex', position: 'absolute', right: 0, bottom: 0 }}>
              <Tooltip placement="bottom" title="Proceed task">
                <Link to={`/tasks/${id}/proceed`}><Button type="link" icon={<EditOutlined />}></Button></Link>
              </Tooltip>
              <Tooltip placement="bottom" title="Delete task">
                <Button type="link" danger onClick={handleDelete} icon={<DeleteOutlined />}></Button>
              </Tooltip>
            </div> */}
          </StyledCard>
          <TaskDetailModal
            taskId={currentTask?.taskId}
            name={currentTask?.name}
            visible={!!currentTask}
            onClose={() => setCurrentTask(null)}
          />
        </div>
      )
    }
  </Draggable>
}

TaskCard.propTypes = {
  task: PropTypes.any.isRequired
};

TaskCard.defaultProps = {};

export default withRouter(TaskCard);