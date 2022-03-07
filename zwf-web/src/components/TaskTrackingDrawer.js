import { Drawer } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { listTaskTrackings$ } from 'services/taskService';
import { TaskTrackingPanel } from './TaskTrackingPanel';
import { TaskMessageForm } from './TaskMessageForm';



export const TaskTrackingDrawer = React.memo((props) => {
  const { taskId, visible, onClose, width } = props;

  const handleMessageSent = () => {
    listTaskTrackings$(taskId).subscribe();
  }

  return <Drawer
    visible={visible}
    onClose={onClose}
    title="Interactions & Messages"
    destroyOnClose={false}
    closable
    autoFocus
    maskClosable
    width={width}
    bodyStyle={{ padding: 0 }}
    footer={<TaskMessageForm taskId={taskId} onDone={handleMessageSent} />    }
  >
    <TaskTrackingPanel taskId={taskId} />
  </Drawer>
});

TaskTrackingDrawer.propTypes = {
  taskId: PropTypes.string.isRequired,
  width: PropTypes.number,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

TaskTrackingDrawer.defaultProps = {
  width: 500,
  visible: false,
  onClose: () => { },
};

