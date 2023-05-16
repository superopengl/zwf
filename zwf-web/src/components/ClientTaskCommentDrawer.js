import { Drawer, Tabs } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { listTaskComment$ } from 'services/taskService';
import { TaskCommentDisplayPanel } from './TaskCommentDisplayPanel';
import { HistoryOutlined, MessageOutlined } from '@ant-design/icons';
import { UserNameCard } from './UserNameCard';
import { TaskLogPanel } from './TaskLogPanel';
import { TaskCommentInputForm } from './TaskCommentInputForm';



export const ClientTaskCommentDrawer = React.memo((props) => {
  const { taskId, open, onClose, width } = props;

  const handleMessageSent = () => {
    listTaskComment$(taskId).subscribe();
  }

  return <Drawer
    open={open}
    onClose={onClose}
    title="Comments"
    destroyOnClose={true}
    closable
    autoFocus
    maskClosable
    width={width}
  // bodyStyle={{ padding: 0 }}
  // footer={<TaskMessageForm taskId={taskId} onDone={handleMessageSent} />}
  >
    <TaskCommentDisplayPanel taskId={taskId} />
  </Drawer>
});

ClientTaskCommentDrawer.propTypes = {
  taskId: PropTypes.string.isRequired,
  width: PropTypes.number,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

ClientTaskCommentDrawer.defaultProps = {
  width: 500,
  open: false,
  onClose: () => { },
};

