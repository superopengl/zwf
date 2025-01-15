import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Card, Tooltip, Form, Switch, Input, Space, Typography } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import { DeleteOutlined, LockFilled, HolderOutlined, EyeInvisibleFilled } from '@ant-design/icons';
import { Divider } from 'antd';
import { FieldEditPanel } from './FieldEditPanel';
import styled from 'styled-components';
import { FieldItem } from './FieldItem';

const { Text, Paragraph } = Typography

const StyledCard = styled(ProCard)`
cursor: move;
&:hover {
  border: 1px solid #0FBFC4;

  .itemHolder {
    background-color: #0FBFC444;
  }
}
`;

const StyledHolder = styled(ProCard)`
height: 100%;
// background-color: #f0f0f0;

.ant-pro-card-body {
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 900;
  font-size: 20px;
}
`;




export const FieldEditableItem = (props) => {
  const { field, index, onDragging, onChange, onDrop, onDelete } = props;
  const { id, name, type } = field;

  const [editPanelOpen, setEditPanelOpen] = React.useState(false);
  const [fieldItem, setFieldItem] = React.useState(field);

  React.useEffect(() => {
    if (!editPanelOpen && field !== fieldItem) {
      onChange(fieldItem);
    }
  }, [editPanelOpen, onChange]);

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
  const opacity = isDragging ? 0 : 1;

  React.useEffect(() => {
    if(isDragging) {
      setEditPanelOpen(false);
    }
  }, [isDragging]);
  drag(drop(ref))

  const handleFieldChange = (values) => {
    setFieldItem(values);
  }

  const style = editPanelOpen ? {
    borderColor: '#0FBFC4',
  } : null

  return <FieldEditPanel trigger="click" open={editPanelOpen} 
  onOpenChange={setEditPanelOpen} 
  field={fieldItem} 
  onChange={handleFieldChange}
  onDelete={onDelete}
  >
    <StyledCard
      ref={ref}
      data-handler-id={handlerId}
      size="small"
      bordered
      hoverable
      split="vertical"
      style={{ ...style, opacity }}>
      <StyledHolder
        colSpan="24px"
        // title={fieldItem.official ? <Tooltip title="Official only field"><LockFilled /></Tooltip> : null}
        className="itemHolder">
        <HolderOutlined />
      </StyledHolder>
      <ProCard
      title={<Space>
        {fieldItem.required && <Text type="danger">*</Text>}
        {fieldItem.name} 
        {fieldItem.official && <Tooltip title="Official only field. Client cannot see."><EyeInvisibleFilled /></Tooltip>}
        </Space>}
      // extra={fieldItem.official ? <Tooltip title="Official only field. Client cannot see."><EyeInvisibleFilled /></Tooltip> : null}
      >
        {/* <Field valueType={fieldItem.type || 'text'} text={['open', 'closed']} mode="edit" /> */}
        <FieldItem field={fieldItem} />
        {/* {fieldItem.description && <Paragraph type="secondary">{fieldItem.description}</Paragraph>} */}
      </ProCard>
    </StyledCard>
  </FieldEditPanel>
}


FieldEditableItem.propTypes = {
  index: PropTypes.number.isRequired,
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    required: PropTypes.bool,
    official: PropTypes.bool,
    description: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDragging: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
};

FieldEditableItem.defaultProps = {
  field: {},
  onChange: () => { },
  onDelete: () => { },
  onDragging: () => { },
  onDrop: () => { },
};