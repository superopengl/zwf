import React from 'react';

import PropTypes from 'prop-types';
import { TaskCard } from './TaskCard';
import { useDrag } from 'react-dnd'

export const TaskDraggableCard = (props) => {
  const { task, searchText } = props;
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'taskCard',
    item: { id: task.id, status: task.status },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return <div ref={drag}
    style={{ opacity: isDragging ? 0.5 : 1 }}>
    <TaskCard task={task} searchText={searchText} />
  </div>
};

TaskDraggableCard.propTypes = {
  task: PropTypes.any.isRequired,
  searchText: PropTypes.string,
};

TaskDraggableCard.defaultProps = {};
