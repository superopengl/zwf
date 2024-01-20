import { Row, Col, Space, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { changeTaskStatus$ } from '../../services/taskService';
import styled from 'styled-components';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { TaskDraggableCard } from '../../components/TaskDraggableCard';
import PropTypes from 'prop-types';

const { Title } = Typography;

const StyledRow = styled(Row)`
  height: 100%;
  min-height: calc(100vh - 180px);
`;

const StyledColumn = styled(Space)`
border-radius: 4px;
background-color: rgb(250,250,250);
height: 100%;
width: 100%;
padding: 8px;
`;

const COLUMN_DEFS = [
  {
    status: 'todo',
    label: 'To Do',
    bgColor: '#f5f5f5',
    hoverColor: '#bfbfbf',
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    bgColor: '#1890ff11',
    hoverColor: '#1890ff',
  },
  {
    status: 'pending_fix',
    label: 'Await client reply',
    bgColor: '#06117811',
    hoverColor: '#061178',
  },
  {
    status: 'pending_sign',
    label: 'Await client sign',
    bgColor: '#f5222d11',
    hoverColor: '#f5222d',
  },
  {
    status: 'signed',
    label: 'Signed',
    bgColor: '#5c001111',
    hoverColor: '#5c0011',
  },
  {
    status: 'done',
    label: 'Done',
    bgColor: '#52c41a11',
    hoverColor: '#52c41a',
  },
]

export const TaskBoardPanel = props => {
  const { tasks, onChange, searchText } = props;

  const onDragEnd = result => {
    const { draggableId: taskId, destination: { droppableId: status } } = result;
    const task = tasks.find(j => j.id === taskId);
    if (task.status !== status) {
      task.status = status;
      changeTaskStatus$(task.id, status).subscribe(() => {
        onChange(task);
      });
    }
  }

  return <DragDropContext onDragEnd={onDragEnd}>
      <StyledRow gutter={10}>
        {COLUMN_DEFS.map((s, i) => <Droppable droppableId={s.status} key={i}>
          {(provided, snapshot) => (
            <Col span={4}
              ref={provided.innerRef}>
              <StyledColumn direction="vertical" style={{
                backgroundColor: s.bgColor,
                borderWidth: 2,
                borderStyle: `${snapshot.isDraggingOver ? 'dashed' : 'solid'}`,
                borderColor: `${snapshot.isDraggingOver ? s.hoverColor : s.bgColor}`
              }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Title level={5} style={{ textAlign: 'center', margin: '0 auto' }} type="secondary">{s.label}</Title>
                  <Text strong>{tasks.filter(j => j.status === s.status).length}</Text>
                </Space>
                {tasks.filter(j => j.status === s.status).map((task, index) => {
                  // if (task.statusId === status.id)
                  return (
                    <TaskDraggableCard key={task.id} index={index} task={task} onChange={onChange} searchText={searchText} />
                  );
                })
                }
                {provided.placeholder}
              </StyledColumn>
            </Col>
          )}
        </Droppable>)}
      </StyledRow>
  </DragDropContext>

}

TaskBoardPanel.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  searchText: PropTypes.string,
};

TaskBoardPanel.defaultProps = {};
