import { Drawer, Tabs } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { getTaskTalk$ } from 'services/taskService';
import { TaskTalkDisplayPanel } from './TaskTalkDisplayPanel';
import { HistoryOutlined, MessageOutlined } from '@ant-design/icons';
import { UserNameCard } from './UserNameCard';
import { TaskTimelinePanel } from './TaskTimelinePanel';
import { TaskTalkTextInput } from './TaskTalkTextInput';



export const ClientTaskCommentDrawer = React.memo((props) => {
  const { taskId, open, onClose, width } = props;

  const handleMessageSent = () => {
    getTaskTalk$(taskId).subscribe();
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
    <TaskTalkDisplayPanel taskId={taskId} />
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

