import React, { useState } from 'react';
import { Form, Row, Button, Input, List, Col, Alert } from 'antd';
import { camelCase, isEmpty } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
// import arrayMove from 'array-move';
import { SortableContainer } from 'react-sortable-hoc';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  useSortable,
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Import style
import FieldDefEditorCard from './FieldDefEditorCard';
import { PlusOutlined } from '@ant-design/icons';

const SortableItem = ({ index, value, onDelete, onChange }) => (
  <FieldDefEditorCard
    onDelete={onDelete}
    onChange={onChange}
    index={index}
    value={value}
  />
);

const SortableElem = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      hahah
    </div>
  );
}

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: grid * 2,
  // margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "none",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "#13c2c222" : "rgba(255,255,255,0)",
  padding: grid,
  width: '100%'
});

const FieldEditor = (props) => {

  const { items, header, onChange } = props;

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
  }

  const handleDeleteField = (index) => {
    items.splice(index, 1);
    onChange([...items]);
  }

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
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <Col
                    span={24}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  // style={getItemStyle(
                  //   snapshot.isDragging,
                  //   provided.draggableProps.style
                  // )}
                  >
                    <FieldDefEditorCard
                      index={index}
                      items={items}
                      value={item}
                      onChange={onChange}
                      onDelete={() => handleDeleteField(index)}
                    />
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
};

const createEmptyField = () => {
  return {
    id: uuidv4(),
    type: 'input',
    label: '',
    description: '',
  }
}

const checkLabels = items => {
  const notValid = items.filter(
    item => item.label === '' || item.label === undefined || item.label === null
  );

  return notValid.length === 0;
};

const checkOptions = items => {
  for (let i = 0; i < items.length; i += 1) {
    const currQuestion = items[i];
    if (
      currQuestion.type === 'radio' ||
      currQuestion.type === 'checkbox' ||
      currQuestion.type === 'select'
    ) {
      const currOptions = currQuestion.options;
      if (currOptions.length === 0) {
        return false;
      }

      for (let j = 0; j < currOptions.length; j += 1) {
        if (currOptions[j].value === '') {
          return false;
        }
      }
    }
  }
  return true;
};

const FieldList = (props) => {
  const { value, onChange, header } = props;
  // const bottomRef = useRef(null);
  const handleChange = change => {
    onChange(change);
  };
  return (
    <>
      <Row style={{ background: '#ECECEC' }}>
        <FieldEditor
          items={value}
          onChange={handleChange}
          header={header}
          onSortEnd={({ oldIndex, newIndex }) => {
            // Re-assigned avoid mutation.
            let updatedSchema = value;
            updatedSchema = arrayMove(updatedSchema, oldIndex, newIndex);
            updatedSchema.forEach((e, index) => {
              e.field = camelCase(`Question ${index + 1}`);
            });
            handleChange(updatedSchema);
          }}
        />
      </Row>
      <Row>
        <Button
          style={{ marginTop: 10 }}
          type="primary"
          icon={<PlusOutlined />}
          // block
          onClick={() => {
            const updatedList = [
              ...value,
              createEmptyField(),
            ];
            handleChange(updatedList);
          }}
        >
          Add field
        </Button>
      </Row>
      <pre>{JSON.stringify(value, null, 2)}</pre>

    </>
  );
};

export const FormBuilder = (props) => {
  const { formStructure, onSave, onError } = props;

  const initialValues = {
    name: formStructure?.name || '',
    description: formStructure?.description || '',
    schema: isEmpty(formStructure.schema) ? [createEmptyField()] : formStructure.schema
  };

  const handleSubmit = formData => {
    if (onSave) onSave(formData);
  };

  return <>
    <Form
      onKeyPress={e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          return false;
        }
        return true;
      }}
      colon={false}
      onFinish={handleSubmit}
      noValidate
      initialValues={initialValues}
    // id={formId}
    >
      <Form.Item label="Task template name" name="name" rules={[{ required: true, message: ' ' }]}>
        <Input placeholder="Task template name" />
      </Form.Item>
      <Form.Item label="Description" name="description" rules={[{ required: true, message: ' ' }]}>
        <Input.TextArea
          placeholder="Task template description"
          autosize={{ minRows: 2, maxRows: 6 }}
        />
      </Form.Item>
      <Form.Item name="schema" rules={[
        {
          required: true,
          validator: async (rule, value, callback) => {
            if (!checkLabels(value)) {
              throw new Error(
                'Please provide questions. All questions are required.'
              );
            }
            if (!checkOptions(value)) {
              throw new Error(
                'Please provide options for questions. All options require names.'
              );
            }
          },
        },
      ]}>
        <FieldList />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit">Save</Button>
      </Form.Item>
    </Form>
  </>
}


