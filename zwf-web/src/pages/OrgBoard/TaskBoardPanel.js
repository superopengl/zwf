import { Row, Col, Space, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { changeTaskStatus$ } from '../../services/taskService';
import styled from 'styled-components';
import { TaskDraggableCard } from '../../components/TaskDraggableCard';
import PropTypes from 'prop-types';
import { DndProvider, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TaskBoardContext } from 'contexts/TaskBoardContext';

const { Title } = Typography;

const StyledRow = styled(Row)`
  height: 100%;
  min-height: 300px;
`;

const StyledColumn = styled(Space)`
border-radius: 4px;
// border-color: rgb(250,250,250);
height: 100%;
width: 100%;
padding: 8px 4px;
`;

const COLUMN_DEFS = [
  {
    status: 'todo',
    label: 'To Do',
    bgColor: '#F1F2F5',
    hoverColor: '#d9d9d9',
  },
  {
    status: 'in_progress',
    label: 'In Progress',
    bgColor: '#F1F2F5',
    hoverColor: '#0051D9',
  },
  {
    status: 'action_required',
    label: `Await Client's Actions`,
    bgColor: '#F1F2F5',
    hoverColor: '#F53F3F',
  },
  {
    status: 'done',
    label: 'Completed',
    bgColor: '#F1F2F5',
    hoverColor: '#00B42A',
  },
]

export const TaskBoardPanel = props => {
  const { tasks, onChange, searchText, showClient, showTags } = props;

  return <DndProvider backend={HTML5Backend}>
    <TaskBoardContext.Provider value={{showClient, showTags}}>
      <StyledRow gutter={10}>
        {COLUMN_DEFS.map((s, i) => <TaskBoardColumn
          status={s.status}
          key={i}
          searchText={searchText}
          onChange={onChange}
          tasks={tasks.filter(t => s.status === t.status)}
        />)}
      </StyledRow>
    </TaskBoardContext.Provider>
  </DndProvider>
}

const TaskBoardColumn = props => {
  const { status, tasks, onChange, searchText } = props;
  const style = COLUMN_DEFS.find(x => x.status === status);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'taskCard',
    drop: (item) => changeTaskStatus(item),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const changeTaskStatus = item => {
    const { id: taskId, status: oldStatus } = item;
    if (oldStatus !== status) {
      changeTaskStatus$(taskId, status).subscribe(() => {
        onChange();
      });
    }
  }

  return <Col span={6} ref={drop}>
    <StyledColumn direction="vertical" style={{
      backgroundColor: isOver ? `${style.hoverColor}11` : style.bgColor,
      borderWidth: 2,
      borderStyle: isOver ? 'dashed' : 'solid',
      borderColor: isOver ? style.hoverColor : style.bgColor
    }}>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16, opacity: 0.4 }}>
        <Text strong style={{ textAlign: 'center', margin: '0 auto' }}>{style.label}</Text>
        <Text strong>{tasks.length}</Text>
      </Space>
      {tasks.map(task => <TaskDraggableCard key={task.id} task={task} searchText={searchText} />)}
    </StyledColumn>
  </Col>
}

TaskBoardPanel.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func,
  searchText: PropTypes.string,
  showClient: PropTypes.bool,
};

TaskBoardPanel.defaultProps = {
  showClient: true,
  showTags: true,
};
