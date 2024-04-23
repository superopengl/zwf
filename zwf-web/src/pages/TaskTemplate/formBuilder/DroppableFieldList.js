import React from 'react';
import { Row, Col } from 'antd';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { FieldItemEditor } from './FieldItemEditor';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledDragItem = styled(Col)`
position: relative;

// &::before {
//   content: ':::';
//   position: absolute;
//   left: 0;
//   top: 4px;
//   bottom: 0;
//   margin: auto;
//   color: rgb(192, 192, 192);
// }
`;

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getDroppableAreaStyle = isDraggingOver => ({
  background: isDraggingOver ? "#37AFD222" : "none",
  padding: 0,
  // width: '100%'
});

const getDraggingItemStyle = (isDragging, draggableStyle) => ({
  ...draggableStyle,
  background: isDragging ? '#ffffff77' : 'none',
  padding: isDragging ? 8 : 0,
  border: isDragging ? '1px dashed rgb(217, 217, 217)' : 'none',
  borderRadius: isDragging ? 4 : 0,
});

export const DroppableFieldList = (props) => {

  const { items, onChange } = props;

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex !== destIndex) {
      const newItems = reorder(
        items,
        sourceIndex,
        destIndex
      );

      onChange(newItems);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <Row
            type="flex"
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getDroppableAreaStyle(snapshot.isDraggingOver)}
          >
            {items.map((item, index) => (
              <Draggable key={index} draggableId={`${index}`} index={index}>
                {(provided, snapshot) => (
                  <StyledDragItem
                    span={24}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getDraggingItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    <FieldItemEditor
                      value={item}
                      index={index}
                      onDelete={() => onChange(items.filter((x, i) => i !== index))}
                      onChange={updatedItem => onChange(items.map((x, i) => i === index ? updatedItem : x))}
                    />
                  </StyledDragItem>

                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Row>
        )}
      </Droppable>
    </DragDropContext>
  );
}

DroppableFieldList.propTypes = {
  onChange: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired
};

DroppableFieldList.defaultProps = {
};