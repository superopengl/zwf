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
    bgColor: '#d9d9d922',
    hoverColor: '#d9d9d9',
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    bgColor: '#37AFD222',
    hoverColor: '#37AFD2',
  },
  {
    status: 'action_required',
    label: `Await Client's Actions`,
    bgColor: '#cd201f22',
    hoverColor: '#cd201f',
  },
  {
    status: 'done',
    label: 'Completed',
    bgColor: '#52c41a22',
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
        {(provided, snapshot) => {
          const tasksInCol = tasks.filter(t => s.status === t.status);
          return (
            <Col span={6}
              ref={provided.innerRef}>
              <StyledColumn direction="vertical" style={{
                backgroundColor: s.bgColor,
                borderWidth: 2,
                borderStyle: `${snapshot.isDraggingOver ? 'dashed' : 'solid'}`,
                borderColor: `${snapshot.isDraggingOver ? s.hoverColor : s.bgColor}`
              }}>
                <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16, opacity: 0.4 }}>
                  <Title level={5} style={{ textAlign: 'center', margin: '0 auto' }}>{s.label}</Title>
                  <Text strong>{tasksInCol.length}</Text>
                </Space>
                {tasksInCol.map((task, index) => {
                  // if (task.statusId === status.id)
                  return (
                    <TaskDraggableCard key={task.id} index={index} task={task} onChange={onChange} searchText={searchText} />
                  );
                })
                }
                {provided.placeholder}
              </StyledColumn>
            </Col>
          )
        }}
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
