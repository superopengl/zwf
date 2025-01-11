import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Card, Tooltip, Form, Switch, Input, Button } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { Divider } from 'antd';

const style = {
  // border: '1px dashed gray',
  // padding: '0.5rem 1rem',
  // marginBottom: '.5rem',
  // backgroundColor: 'white',
  cursor: 'move',
}

export const FieldEditableItem = (props) => {
  const { value, index, onDragging, onDrop } = props;
  const { id, name, type } = value;

  const [collapsed, setCollapsed] = React.useState(true);


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
  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  return <ProCard ref={ref}
    data-handler-id={handlerId}
    title={<>{name} ({type}: {index} {isDragging ? 'dragging' : ''})</>}
    size="small"
    bordered
    hoverable
    extra={[
      <Button key="delete" danger type="text" icon={<DeleteOutlined />}></Button>,
      <Tooltip
        key="edit"
        placement="rightTop"
        color="white"
        trigger="click"
        title={<div style={{ padding: '1rem' }}>
          <Form
            // labelCol={{ span: 8 }}
            // wrapperCol={{ span: 16 }}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item name="name" label="Field Name" valuePropName="checked" required>
              <Input allowClear />
            </Form.Item>
            <Form.Item name="required" label="Required" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="official" label="Official only" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="description" label="Description" valuePropName="checked">
              <Input.TextArea allowClear showCount maxLength={200} autoSize={{ minRows: 3 }} />
            </Form.Item>
          </Form>
        </div>}
      >
        <Button type="link" icon={<EditOutlined />}></Button>
      </Tooltip>
    ]
    }
    style={{ ...style, opacity }}>
    <Field valueType={type || 'text'} text={['open', 'closed']} mode="edit" />
  </ProCard>
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