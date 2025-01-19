import React from 'react';
import { useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Row, Col, Card, Typography } from 'antd';
import { FieldEditableItem } from './FieldEditableItem';
import update from 'immutability-helper'
const { Paragraph } = Typography;

const style = {
  height: '100%',
  width: '100%',
  padding: '1rem',
}
export const FieldListEditable = props => {
  const { fields, onChange, onSelect } = props;

  const [list, setList] = React.useState(fields);

  React.useEffect(() => {
    setList(fields)
  }, [fields]);

  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: 'field-control',
    drop: () => ({ name: 'Dustbin' }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }))
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

  const handleDrop = () => {
    onChange(list);
  };

  const handleFieldChange = (index, changedField) => {
    list[index] = changedField;
    onChange([...list]);
  }

  const handleDelete = (index) => {
    list.splice(index, 1);
    onChange([...list]);
  }

  return (
    <div ref={drop} style={{ ...style, backgroundColor, height: '100%' }}>
      <Row gutter={[8, 8]}>
        {list.map((field, i) => <Col key={field.name} span={24}>
          <FieldEditableItem field={field}
            onSelect={() => onSelect(field)}
            index={i}
            onDragging={handleDragging}
            onDrop={handleDrop}
            onChange={changedField => handleFieldChange(i, changedField)}
            onDelete={() => handleDelete(i)}
          />
        </Col>)}
        <Col span={24}>
          <Paragraph type="secondary" style={{ textAlign: 'center', margin: '2rem auto' }}>Drag a control from the left list to here to add a new field.</Paragraph>
        </Col>
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