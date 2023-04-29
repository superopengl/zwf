import React from 'react';
import { useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Row, Col, Card, Typography } from 'antd';
import { FieldEditableItem } from './FieldEditableItem';
import update from 'immutability-helper'
import { v4 as uuidv4 } from 'uuid';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { Empty } from 'antd';
import { EditFieldsContext } from 'contexts/EditFieldsContext';

const { Paragraph, Text } = Typography;

const style = {
  height: '100%',
  width: '100%',
  padding: '1rem',
}
export const FieldListEditable = () => {

  const {fields, setFields} = React.useContext(EditFieldsContext);

  // const [{ canDrop, isOver }, drop] = useDrop(() => ({
  //   accept: 'field',
  //   // accept: 'field-control',
  //   drop: () => ({ name: 'Dustbin' }),
  //   collect: (monitor) => ({
  //     isOver: monitor.isOver(),
  //     canDrop: monitor.canDrop(),
  //   }),
  // }))
  const canDrop = false;
  const isOver = false;

  const isActive = canDrop && isOver
  let backgroundColor = '#ffffff';
  if (isActive) {
    backgroundColor = '#0FBFC433'
  } else if (canDrop) {
    backgroundColor = 'transparent'
  }

  const handleDragging = React.useCallback((dragIndex, hoverIndex) => {
    setFields((prevFields) => {
      const updatedList = update(prevFields, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevFields[dragIndex]],
        ],
      });

      const nextList = arrangeOridinals(updatedList);

      return nextList;
    })
  }, []);

  const handleDrop = () => {
    setFields([...fields]);
  };

  const handleFieldChange = (index, newValues) => {
    fields[index] = newValues;
    setFields([...fields]);
  }

  const handleDelete = (index) => {
    fields.splice(index, 1);
    setFields([...fields]);
  }

  const arrangeOridinals = array => {
    array.forEach((f, index) => f.ordinal = index + 1)
    return array;
  };

  const isEmpty = !fields?.length;

  return (
    <div
      // ref={drop} 
      style={{ ...style, backgroundColor, height: '100%' }}>
      <Row gutter={[8, 8]} justify="center">
        {/* <DebugJsonPanel value={list} /> */}
        {isEmpty ?
          <Empty description="No field defined. Drag control from the left panel to here to add new field." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : fields.map((field, i) => !field ? <>NULL</> : <Col key={field.id} span={24}>
            <FieldEditableItem field={field}
              index={i}
              open={i === 0}
              onDragging={handleDragging}
              onDrop={handleDrop}
              onChange={changedField => handleFieldChange(i, changedField)}
              onDelete={() => handleDelete(i)}
            />
          </Col>)}
      </Row>
      {/* <DebugJsonPanel value={list} /> */}
    </div>
  )
}

FieldListEditable.propTypes = {
  fields: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

FieldListEditable.defaultProps = {
  fields: [],
  onChange: () => { }
};