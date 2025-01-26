import React from 'react';
import { useDrag } from 'react-dnd'
import { Card, Space } from 'antd';
import Icon, { CloseOutlined, DeleteFilled, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import { ProCard } from '@ant-design/pro-components';

const StyledCard = styled(ProCard)`
margin-bottom: 8px;
background-color: white;
cursor: grab;

&:hover {
  border-color: #0FBFC4;
}
`;


export const FieldControlItem = (props) => {
  const { icon, label, type, onDropStart, onDropDone, index } = props;
  const indexRef = React.useRef(index);
  const newFieldIdRef = React.useRef(uuidv4());

  React.useEffect(() => {
    indexRef.current = index;
    newFieldIdRef.current = uuidv4();
  }, [index]);

  const [{ isDragging }, drag] = useDrag(() => ({
    // type: 'field-control',
    type: 'field',
    item: () => {
      const newFieldId = newFieldIdRef.current;
      onDropStart(newFieldId);
      return {
        id: newFieldId,
        index: indexRef.current,
        type
      };
    },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult()
      if (item && dropResult) {
        onDropDone();
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
    options: {
      dropEffect: 'copy'
    }
  }))

  // React.useEffect(() => {
  //   if (isDragging) document.body.style.cursor = 'grab !important';
  //   else document.body.style.cursor = 'normal';
  // }, [isDragging]);


  const style = isDragging ? {
    borderStyle: 'dashed',
    opacity: 0.4,
    background: 'transparent',
    cursor: 'grabbing',
  } : null;

  return <StyledCard
    bordered
    size="small"
    ref={drag}
    bodyStyle={{ padding: '0.5rem 0.5rem' }}
    style={style}
    hoverable
  >
    <Space size="small">
      <Icon component={() => icon} />
      {label}
    </Space>
  </StyledCard>

  // return <div ref={drag} style={{ ...style, opacity }} data-testid={`box`}>
  //   {label}
  // </div>
}


FieldControlItem.propTypes = {
  onDropStart: PropTypes.func,
  onDropDone: PropTypes.func.isRequired,
  icon: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

FieldControlItem.defaultProps = {
  onDropStart: (newFieldId) => { },
  onDropDone: () => { },
};