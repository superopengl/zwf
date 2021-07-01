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
import SortableCard from './SortableCard';
import { PlusOutlined } from '@ant-design/icons';

const SortableItem = ({ index, value, onDelete, onChange }) => (
  <SortableCard
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
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: '100%'
});

const SortableSchema = (props) => {

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

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    <SortableCard
                      value={item}
                    />
                  </div>

                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}

        {/* <List
        ref={setNodeRef}
        style={style}
        header={header}
        size="large"
        dataSource={items}
        renderItem={(item, index) => {
          return (
            <SortableItem
              onChange={onChange}
              onDelete={deletedItem => {
                if (deletedItem) {
                  let found = false;
                  const updatedSchema = items.filter((i, itemIndex) => {
                    if (i.field === deletedItem.field) {
                      found = true;
                      return false;
                    }
                    if (found) {
                      // eslint-disable-next-line no-param-reassign
                      i.field = camelCase(`Question ${itemIndex}`);
                    }
                    return true;
                  });
                  onChange(updatedSchema);
                }
              }}
              index={index}
              value={{ ...item, index, items }}
            />
          );
        }}
      /> */}
      </Droppable>
    </DragDropContext>
  );
};

const createEmptyField = () => {
  return {
    id: uuidv4(),
    type: 'input',
    placeholder: '',
    label: ``,
    field: camelCase(`Question1`),
    rules: [{ required: false, message: 'Field is required' }],
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

const SchemaList = (props) => {
  const { value, onChange, header } = props;
  // const bottomRef = useRef(null);
  const handleChange = change => {
    onChange(change);
  };
  return (
    <>
        <Row style={{ background: '#ECECEC' }}>
          <SortableSchema
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
            block
            onClick={() => {
              const updatedList = [
                ...value,
                createEmptyField(),
              ];
              handleChange(updatedList);
            }}
          >
            Add new question
          </Button>
        </Row>
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
      <Form.Item label="Name" name="name" rules={[{ required: true, message: ' ' }]}>
        <Input placeholder="Add form name" />
      </Form.Item>
      <Form.Item label="Description" name="description" rules={[{ required: true, message: ' ' }]}>
        <Input.TextArea
          placeholder="Add form description"
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
        <SchemaList />
      </Form.Item>
      <div
        style={{
          margin: '30 0',
        }}
      >
        <Button htmlType="submit">Save</Button>
      </div>
    </Form>
  </>
}

const FormBuilderRaw = ({
  onSave,
  noSave = false,
  onError,
  formStructure = {},
  form: { getFieldDecorator, validateFields },
  formId = null,
}) => {
  const [errors, setErrors] = useState([]);

  const handleSubmit = e => {
    setErrors([]);
    e.preventDefault();
    validateFields((err, formData) => {
      if (!err) {
        if (onSave) onSave(formData);
      } else if (onError) {
        setErrors(err.schema.errors);
        onError(err);
      }
    });
  };

  if (formStructure.id)
    getFieldDecorator('id', { initialValue: formStructure.id });
  if (formStructure.type)
    getFieldDecorator('type', { initialValue: formStructure.type });

  return (
    <>
      {errors.length > 0 && (
        <Alert
          type="error"
          message="Error"
          showIcon
          description={
            // eslint-disable-next-line react/jsx-wrap-multilines
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          }
        />
      )}
      <Form
        onKeyPress={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            return false;
          }
          return true;
        }}
        colon={false}
        onSubmit={handleSubmit}
        noValidate
        id={formId}
      >
        <Form.Item label="Name">
          {getFieldDecorator('name', {
            initialValue: formStructure.name || '',
          })(<Input placeholder="Add form name" />)}
        </Form.Item>
        <Form.Item label="Description">
          {getFieldDecorator('description', {
            initialValue: formStructure.description || '',
          })(
            <Input.TextArea
              placeholder="Add form description"
              autosize={{ minRows: 2, maxRows: 6 }}
            />
          )}
        </Form.Item>
        <Row>
          <Form.Item validateStatus={null} help={null}>
            {getFieldDecorator('schema', {
              initialValue: !isEmpty(formStructure.schema)
                ? formStructure.schema
                : [],
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (!checkLabels(value)) {
                      callback(
                        'Please provide questions. All questions are required.'
                      );
                    }
                    if (!checkOptions(value)) {
                      callback(
                        'Please provide options for questions. All options require names.'
                      );
                    }
                    callback();
                  },
                },
              ],
            })(<SchemaList />)}
          </Form.Item>
        </Row>

        <div
          style={{
            margin: '30 0',
          }}
        >
          {!noSave && <Button htmlType="submit">Save</Button>}
        </div>
      </Form>
    </>
  );
};


