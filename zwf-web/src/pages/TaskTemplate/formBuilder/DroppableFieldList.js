import React from 'react';
import { Row, Col } from 'antd';
import { FieldItemEditor } from './FieldItemEditor';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { DndProvider, useDrop, useDrag } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import update from 'react-addons-update';
import { v4 as uuidv4 } from 'uuid';


export const DroppableFieldList = (props) => {

  const { items, onChange } = props;

  const [allItems, setAllItems] = React.useState(items.map(x => {
    x.id = x.id || uuidv4()
    return x;
  }));

  React.useEffect(() => {
    setAllItems(items.map(x => {
      x.id = x.id || uuidv4()
      return x;
    }))
  }, [items]);

  const handleDelete = deletedIndex => {
    onChange(allItems.filter((x, i) => i !== deletedIndex));
  }

  const handleChange = (index, updatedItem) => {
    allItems[index] = updatedItem;
    onChange([...allItems]);
  }

  const handleDropEnd = () => {
    onChange(allItems);
  }

  const handleMoveItem = React.useCallback((dragIndex, hoverIndex) => {
    setAllItems((prevCards) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      }),
    )
  }, []);

  const renderCard = (field, index) => {
    return (
      <DraggableFieldItem
        key={field.id}
        index={index}
        field={field}
        onMoveItem={handleMoveItem}
        onDelete={() => handleDelete(index)}
        onChange={updatedItem => handleChange(index, updatedItem)}
        onDropEnd={() => handleDropEnd()}
      />
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Row
        type="flex"
      // ref={drop}
      // style={getDroppableAreaStyle(isOver)}
      >
        {allItems.map((item, index) => <DraggableFieldItem
          key={item.id}
          index={index}
          field={item}
          onMoveItem={handleMoveItem}
          onDelete={() => handleDelete(index)}
          onChange={updatedItem => handleChange(index, updatedItem)}
          onDropEnd={() => handleDropEnd()}
        />)}
      </Row>
    </DndProvider>
  );
}

DroppableFieldList.propTypes = {
  onChange: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired
};

DroppableFieldList.defaultProps = {
};

export const DraggableFieldItem = ({ field, index, onMoveItem, onDelete, onChange, onDropEnd }) => {
  const style = {
    // border: '1px dashed gray',
    // padding: '0.5rem 1rem',
    // marginBottom: '.5rem',
    // backgroundColor: 'white',
    cursor: 'move',
  }

  const ref = React.useRef(null)
  const [{ handlerId }, drop] = useDrop({
    accept: 'taskFields',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    drop(item, monitor) {
      onDropEnd();
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      onMoveItem(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag] = useDrag({
    type: 'taskFields',
    item: () => {
      return { id: field.id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <Col span={24} ref={ref} style={{ ...style, opacity }} data-handler-id={handlerId}>
      {/* {field.name} */}
      <FieldItemEditor
        value={field}
        index={index}
        onDelete={onDelete}
        onChange={onChange}
      />
    </Col>
  )
}
