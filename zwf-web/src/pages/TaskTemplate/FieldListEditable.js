import React from 'react';
import { useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Row, Col, Card, Typography } from 'antd';
import { FieldEditableItem } from './FieldEditableItem';
import update from 'immutability-helper'
const {Paragraph} = Typography;

const style = {
  height: '100%',
  width: '100%',
}
export const FieldListEditable = props => {
  const { fields, onChange } = props;

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
  let backgroundColor = 'transparent';
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

  const handleFieldChange = (index, newValues) => {
    list[index] = newValues;
    onChange([...list]);
  }

  return (
    <div ref={drop} style={{ ...style, backgroundColor, height: '100%' }}>
      <Row gutter={[10, 10]}>
        {list.map((field, i) => <Col key={field.name} span={24}>
          <FieldEditableItem field={field} onChange={(newValues) => handleFieldChange(i, newValues)} index={i} onDragging={handleDragging} onDrop={handleDrop} />
        </Col>)}
        <Col span={24}>
        <Paragraph type="secondary" style={{textAlign: 'center', margin: '2rem auto'}}>Drag a control from the left list to here to add a new field.</Paragraph>
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