import React from 'react';
import { Row, Button, Alert } from 'antd';
import { camelCase } from 'lodash';
import { arrayMove } from '@dnd-kit/sortable';
import { PlusOutlined } from '@ant-design/icons';
import { DroppableFieldList } from './DroppableFieldList';
import { createEmptyField } from './TaskTemplateBuilder';
import PropTypes from 'prop-types';
import { showFieldItemEditor } from './showFieldItemEditor';

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
  return (
    <>
      <Alert
        description="Drag and drop field cards to adjust the order. Official only fields are only visible to organasation members."
        showIcon
        closable
        type="info"
        style={{ marginBottom: 20 }}
      />
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
          icon={<PlusOutlined />}
          // block
          onClick={handleAddField}
        >
          Add field
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
