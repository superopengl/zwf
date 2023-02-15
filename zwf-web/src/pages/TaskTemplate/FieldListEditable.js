import React from 'react';
import { useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Row, Col, Card, Typography } from 'antd';
import { FieldEditableItem } from './FieldEditableItem';
import update from 'immutability-helper'
import { v4 as uuidv4 } from 'uuid';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { Empty } from 'antd';

const { Paragraph, Text } = Typography;

const style = {
  height: '100%',
  width: '100%',
  padding: '1rem',
}
export const FieldListEditable = props => {
  const { fields, onChange } = props;

  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    setList(fields.map((f, i) => ({
      id: i,
      ...f,
    })))
  }, [fields]);

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
    setList((prevList) =>
      update(prevList, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevList[dragIndex]],
        ],
      }),
    )
  }, []);

  const handleOnChange = () => {
    const changedFields = list.map(f => {
      const { id, ...cleanedField } = f;
      return cleanedField;
    })
    onChange(changedFields);
  }

  const handleDrop = () => {
    handleOnChange(list);
  };

  const handleFieldChange = (index, newValues) => {
    list[index] = newValues;
    handleOnChange([...list]);
  }

  const handleDelete = (index) => {
    list.splice(index, 1);
    handleOnChange([...list]);
  }

  const isEmpty = !list?.length;

  return (
    <div 
    // ref={drop} 
    style={{ ...style, backgroundColor, height: '100%' }}>
      <Row gutter={[8, 8]} justify="center">
        {/* <DebugJsonPanel value={list} /> */}
        {isEmpty ?
          <Empty description="No field defined. Drag control from the left panel to here to add new field." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : list.map((field, i) => !field ? <>NULL</> : <Col key={field.id} span={24}>
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