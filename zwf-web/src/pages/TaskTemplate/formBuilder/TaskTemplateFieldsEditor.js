import React from 'react';
import { Row, Button, Alert } from 'antd';
import { camelCase } from 'lodash';
import { arrayMove } from '@dnd-kit/sortable';
import { PlusOutlined } from '@ant-design/icons';
import { DroppableFieldList } from './DroppableFieldList';
import { createEmptyField } from './TaskTemplateBuilder';
import PropTypes from 'prop-types';
import { showFieldItemEditor } from './showFieldItemEditor';
import {RiInsertRowTop, RiInsertRowBottom} from 'react-icons/ri';
import Icon from '@ant-design/icons';

export const TaskTemplateFieldsEditor = (props) => {
  const { value, onChange } = props;
  // const form = Form.useFormInstance();
  const handleChange = fields => {
    onChange(fields)
  };

  const handleAddField = () => {
    const defaultField = createEmptyField();
    showFieldItemEditor(defaultField, addedField => {
      handleChange([...value, addedField]);
    });
  }

  const handlePrependField = () => {
    const defaultField = createEmptyField();
    showFieldItemEditor(defaultField, addedField => {
      handleChange([addedField, ...value]);
    });
  }
  return (
    <>
      <Row justify="end">
        <Button
          style={{ marginTop: 16, marginBottom: 24 }}
          type="primary"
          ghost
          icon={<Icon component={() => <RiInsertRowTop />} />}
          // block
          onClick={handlePrependField}
        >
          Add Field On Top
        </Button>
      </Row>
      <DroppableFieldList
        items={value}
        onChange={handleChange}
        onSortEnd={({ oldIndex, newIndex }) => {
          // Re-assigned avoid mutation.
          let updatedSchema = value;
          updatedSchema = arrayMove(updatedSchema, oldIndex, newIndex);
          updatedSchema.forEach((e, index) => {
            e.field = camelCase(`Question ${index + 1}`);
          });
          handleChange(updatedSchema);
        }} />
      <Row justify="end">
        <Button
          style={{ marginTop: 16 }}
          type="primary"
          ghost
          icon={<Icon component={() => <RiInsertRowBottom />} />}
          // block
          onClick={handleAddField}
        >
          Add Field At Bottom
        </Button>
      </Row>
    </>
  );
}

TaskTemplateFieldsEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array.isRequired,
};

TaskTemplateFieldsEditor.defaultProps = {
  onChange: () => { },
  value: [],
};
