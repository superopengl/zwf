import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Card, Tooltip, Form, Switch, Input, Space, Typography } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import { DeleteOutlined, LockFilled, HolderOutlined, EyeInvisibleFilled } from '@ant-design/icons';
import { Divider } from 'antd';
import styled from 'styled-components';
import { FieldItem } from './FieldItem';
import { useOutsideClick } from "rooks";
import { FieldEditFloatPanel } from './FieldEditFloatPanel';

const { Text } = Typography

const StyledCard = styled(ProCard)`
cursor: grab;
border: 1px solid white;

&:hover {
  border: 1px solid #0FBFC4;
  // box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}
`;

export const FieldEditableItem = (props) => {
  const { field, index, onDragging, onSelect, onDrop, onChange, onDelete, open } = props;
  const { id } = field;

  const [focused, setFocused] = React.useState(false);
  const [editing, setEditing] = React.useState(open);

  React.useEffect(() => {
    if (focused) {
      onSelect()
    }
  }, [focused, onSelect]);

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
      return { id, index }
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult) {
        onDrop();
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  drag(drop(ref))

  const style = isDragging ? {
    border: '1px dashed #0FBFC4',
    background: 'transparent',
    cursor: 'grabbing',
    opacity: isDragging ? 0 : 1,
  } : null;

  const handleClick = () => {
    setFocused(true);
  }

  const handleEditPanelOpenChange = open => {
    setEditing(open)
  }

  // useOutsideClick(ref, handleClickOutside);

  return <FieldEditFloatPanel
    field={field}
    trigger="click"
    onChange={onChange}
    onDelete={onDelete}
    open={editing}
    onOpenChange={handleEditPanelOpenChange}
  >
    <StyledCard
      ref={ref}
      data-handler-id={handlerId}
      size="small"
      bordered
      hoverable={false}
      // split="vertical"
      onClick={handleClick}
      style={{ ...style, borderColor: editing ? "#0FBFC4" : undefined, padding: 6 }}
      bodyStyle={{ padding: 0 }}>
      <FieldItem field={field} />
    </StyledCard>
  </FieldEditFloatPanel>
}


FieldEditableItem.propTypes = {
  index: PropTypes.number.isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    official: PropTypes.bool,
    description: PropTypes.string,
  }),
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  onDragging: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  open: PropTypes.bool
};

FieldEditableItem.defaultProps = {
  field: {},
  open: false,
  onChange: () => { },
  onDelete: () => { },
  onSelect: () => { },
  onDragging: () => { },
  onDrop: () => { },
};