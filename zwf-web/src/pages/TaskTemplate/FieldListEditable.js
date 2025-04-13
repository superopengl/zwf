import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { FieldEditableItem } from './FieldEditableItem';
import update from 'immutability-helper'
import { Empty } from 'antd';
import { EditFieldsContext } from 'contexts/EditFieldsContext';
import { DebugJsonPanel } from 'components/DebugJsonPanel';


const style = {
  height: '100%',
  width: '100%',
  padding: '1rem',
}
export const FieldListEditable = () => {

  const {fields, setFields, setDragging} = React.useContext(EditFieldsContext);
  const [activeIndex, setActiveIndex] = React.useState(0);

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
    const updatedList = update(fields, {
      $splice: [
        [dragIndex, 1],
        [hoverIndex, 0, fields[dragIndex]],
      ],
    });

    const nextList = arrangeOridinals(updatedList);

    setFields(nextList);
    setActiveIndex(hoverIndex);
    setDragging(true);
  }, [fields]);

  const handleDrop = () => {
    setFields([...fields]);
    setDragging(false);
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
        {/* <DebugJsonPanel value={fields} /> */}
        {isEmpty ?
          <Empty description="No field defined. Drag control from the left panel to here to add new field." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : fields.map((field, i) => !field ? <>NULL</> : <Col key={field.id} span={24}>
            <FieldEditableItem field={field}
              index={i}
              onClick={() => setActiveIndex(i)}
              editing={i === activeIndex}
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