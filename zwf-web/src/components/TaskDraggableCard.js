import { Space, Card, Modal, Typography } from 'antd';
import Text from 'antd/lib/typography/Text';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import PropTypes from 'prop-types';
import { MailOutlined, MessageOutlined } from '@ant-design/icons';
import { UnreadMessageIcon } from './UnreadMessageIcon';
import { TaskIcon } from './entityIcon';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import { showTaskModal } from 'components/showTaskModal';
import { GlobalContext } from 'contexts/GlobalContext';
import { TaskCard } from './TaskCard';

const { Link: TextLink } = Typography;

const StyledCard = styled(Card)`
position: relative;
box-shadow: 0 1px 2px rgba(0,0,0,0.1);
.ant-card-body {
  padding: 16px;
}

&.unread {
  background-color: rgb(255,255,220);
  font-weight: 600;
}
`;

export const TaskDraggableCard =withRouter( (props) => {

  const { task, index } = props;

  const getItemStyle = (isDragging, draggableStyle) => ({
    // background: isDragging ? "#C0C0C0" : "",
    ...draggableStyle
  });

  return <Draggable draggableId={task.id} index={index}>
    {
      (provided, snapshot) => (
        <div ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}>
          <TaskCard task={task} />
        </div>
      )
    }
  </Draggable>
});

TaskDraggableCard.propTypes = {
  task: PropTypes.any.isRequired
};

TaskDraggableCard.defaultProps = {};
