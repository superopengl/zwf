import React from 'react';
import { withRouter } from 'react-router-dom';
import { Draggable } from 'react-beautiful-dnd';
import PropTypes from 'prop-types';
import { TaskCard } from './TaskCard';

export const TaskDraggableCard =withRouter( (props) => {

  const { task, index, searchText } = props;

  const getItemStyle = (isDragging, draggableStyle) => ({
    // background: isDragging ? "#C0C0C0" : "",
    ...draggableStyle
  });

  return <Draggable draggableId={task.id} index={index}>
    {
      (provided, snapshot) => (
        <div ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
          <TaskCard task={task} searchText={searchText}/>
        </div>
      )
    }
  </Draggable>
});

TaskDraggableCard.propTypes = {
  task: PropTypes.any.isRequired,
  searchText: PropTypes.string,
};

TaskDraggableCard.defaultProps = {};
