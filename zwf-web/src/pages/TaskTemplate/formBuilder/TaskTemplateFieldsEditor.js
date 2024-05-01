import React from 'react';
import { Row, Button, Alert } from 'antd';
import { camelCase } from 'lodash';
import { PlusOutlined } from '@ant-design/icons';
import { DroppableFieldList } from './DroppableFieldList';
import PropTypes from 'prop-types';
import { showFieldItemEditor } from './showFieldItemEditor';
import { RiInsertRowTop, RiInsertRowBottom } from 'react-icons/ri';
import Icon from '@ant-design/icons';

const createEmptyField = () => {
  return {
    type: 'input',
    name: 'Unnamed field',
    description: '',
  }
}

export const TaskTemplateFieldsEditor = (props) => {
  const { value, onChange } = props;

  const handleChange = fields => {
    // Reset fields ordinal
    fields.forEach((f, i) => {
      f.ordinal = i;
    })
    onChange(fields)
  };

  const handleAppendField = () => {
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
          icon={<Icon component={RiInsertRowTop} />}
          // block
          onClick={handlePrependField}
        >
          Add Field On Top
        </Button>
      </Row>
      <DroppableFieldList items={value} onChange={handleChange} />
      <Row justify="end">
        <Button
          style={{ marginTop: 16 }}
          type="primary"
          ghost
          icon={<Icon component={RiInsertRowBottom} />}
          // block
          onClick={handleAppendField}
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
