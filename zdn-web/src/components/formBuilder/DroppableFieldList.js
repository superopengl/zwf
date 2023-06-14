import React from 'react';
import { Row, Col } from 'antd';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import FieldEditCard from './FieldEditCard';
import { reorder, getListStyle } from './TaskTemplateBuilder';
import PropTypes from 'prop-types';


export const DroppableFieldList = (props) => {

  const { items, onChange } = props;

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const newItems = reorder(
      items,
      result.source.index,
      result.destination.index
    );

    onChange(newItems);
  };

  const handleDeleteField = (index) => {
    items.splice(index, 1);
    onChange([...items]);
  };


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <Row
            type="flex"
            gutter={[10, 10]}
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {items.map((item, index) => (
              <Draggable key={index} draggableId={`${index}`} index={index}>
                {(provided, snapshot) => (
                  <Col
                    span={24}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <FieldEditCard
                      index={index}
                      items={items}
                      value={item}
                      onChange={onChange}
                      onDelete={() => handleDeleteField(index)} />
                  </Col>

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