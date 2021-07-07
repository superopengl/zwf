import React from 'react';
import { Row, Button } from 'antd';
import { camelCase } from 'lodash';
import { arrayMove } from '@dnd-kit/sortable';
import { PlusOutlined } from '@ant-design/icons';
import { DroppableFieldList } from './DroppableFieldList';
import { createEmptyField } from './TaskTemplateBuilder';
import PropTypes from 'prop-types';

export const FieldList = (props) => {
  const { value, onChange } = props;
  // const bottomRef = useRef(null);
  const handleChange = change => {
    onChange(change);
  };
  return (
    <>
      {/* <Row style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 4 }}> */}
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
      {/* </Row> */}
      <Row justify="end">
        <Button
          style={{ marginTop: 16 }}
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
    </>
  );
}

FieldList.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array.isRequired,
};

FieldList.defaultProps = {
  onChange: () => {},
  value: [],
};
