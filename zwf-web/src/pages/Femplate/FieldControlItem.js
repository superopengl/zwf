import React from 'react';
import { useDrag } from 'react-dnd'
import { Space } from 'antd';
import Icon from '@ant-design/icons'
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import { ProCard } from '@ant-design/pro-components';

const StyledCard = styled(ProCard)`
margin-bottom: 8px;
background-color: white;
cursor: grab;

&:hover {
  color: #0FBFC4;
  border-color: #0FBFC4;
}
`;


export const FieldControlItem = (props) => {
  const { icon, label, type, onDropStart, onDropDone, onClick, index } = props;
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

  const handleClick = () => {
    onClick(newFieldIdRef.current);
  }


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
    onClick={handleClick}
    hoverable
  >
    <div style={{gap: 8, display: 'flex', alignItems: 'center'}}>
      <Icon component={() => icon} style={{fontSize: 18}}/>
      {label}
    </div>
  </StyledCard>

  // return <div ref={drag} style={{ ...style, opacity }} data-testid={`box`}>
  //   {label}
  // </div>
}


FieldControlItem.propTypes = {
  onDropStart: PropTypes.func,
  onClick: PropTypes.func,
  onDropDone: PropTypes.func.isRequired,
  icon: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

FieldControlItem.defaultProps = {
  onDropStart: (newFieldId) => { },
  onDropDone: () => { },
  onClick: () => { },
};