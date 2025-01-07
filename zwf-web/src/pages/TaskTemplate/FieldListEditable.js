import React from 'react';
import { useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Row, Col, Card } from 'antd';
import { FieldItem } from './FieldItem';
import update from 'immutability-helper'

const style = {
  height: '100%',
  width: '100%',
}
export const FieldListEditable = props => {
  const { fields, onChange } = props;

  const [list, setList] = React.useState(fields);

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
    backgroundColor = 'darkgreen'
  } else if (canDrop) {
    backgroundColor = 'transparent'
  }

  const handleMove = React.useCallback((dragIndex, hoverIndex) => {
    setList((prevList) =>
      update(prevList, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevList[dragIndex]],
        ],
      }),
    )
  }, [])

  return (
    <Card ref={drop} style={{ ...style, backgroundColor }} bodyStyle={{backgroundColor}}>
      <Row gutter={[10, 10]}>
        {list.map((field, i) => <Col key={field.id} span={24}>
          <FieldItem value={field} index={i} onMove={handleMove}/>
        </Col>)}
      </Row>
    </Card>
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