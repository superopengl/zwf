import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Card, Tooltip, Form, Switch, Input, Button } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { FieldEditPanel } from './FieldEditPanel';
import styled from 'styled-components';

const StyledCard = styled(ProCard)`
&:hover {
  border: 1px solid #0FBFC4;

  .itemHolder {
    background-color: #f0f0f0;

  }
}
`;

const StyledHolder = styled(ProCard)`
height: 100%;

.ant-pro-card-body {
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
`;


const style = {
  // border: '1px dashed gray',
  // padding: '0.5rem 1rem',
  // marginBottom: '.5rem',
  // backgroundColor: 'white',
  cursor: 'move',
}

export const FieldEditableItem = (props) => {
  const { value: field, index, onDragging, onDrop } = props;
  const { id, name, type } = field;

  const [editPanelOpen, setEditPanelOpen] = React.useState(false);


  const ref = useRef(null)
  const [{ handlerId }, drop] = useDrop({
    accept: 'field',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
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
      onDragging(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'field',
    item: () => {
      setEditPanelOpen(false);
      return { id, index }
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult) {
        onDrop();
      }
      setEditPanelOpen(true);
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0.6 : 1;

  React.useEffect(() => {
    setEditPanelOpen(!isDragging);
  }, [isDragging]);
  drag(drop(ref))

  const handleFieldChange = (values) => {
    console.log(values);
  }

  return <FieldEditPanel trigger="click" open={editPanelOpen} onOpenChange={setEditPanelOpen} field={field} onChange={handleFieldChange}>
    <StyledCard
      ref={ref}
      data-handler-id={handlerId}
      size="small"
      bordered
      hoverable
      split="vertical"
      style={{ ...style, opacity }}>
      <StyledHolder colSpan="22px" className="itemHolder" >
        <HolderOutlined />
      </StyledHolder>
      <ProCard
        title={<>{name} ({type}: {index} {isDragging ? 'dragging' : ''})</>}
      >
        <Field valueType={type || 'text'} text={['open', 'closed']} mode="edit" />
      </ProCard>
    </StyledCard>
  </FieldEditPanel>
}


FieldEditableItem.propTypes = {
  index: PropTypes.number.isRequired,
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDragging: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
};

FieldEditableItem.defaultProps = {
  onChange: () => { },
  onDelete: () => { },
  onDragging: () => { },
  onDrop: () => { },
};