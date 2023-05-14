import { Drawer } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { TaskLogPanel } from './TaskLogPanel';

export const TaskLogDrawer = React.memo((props) => {
  const { taskId, open, onClose, width } = props;

  return <Drawer
    open={open}
    onClose={onClose}
    title={<>Timeline</>}
    destroyOnClose={true}
    closable
    autoFocus
    maskClosable
    width={width}
  // bodyStyle={{ padding: 0 }}
  // footer={<TaskMessageForm taskId={taskId} onDone={handleMessageSent} />}
  >
    <TaskLogPanel taskId={taskId} />
  </Drawer>
});

TaskLogDrawer.propTypes = {
  taskId: PropTypes.string.isRequired,
  width: PropTypes.number,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

TaskLogDrawer.defaultProps = {
  width: 500,
  open: false,
  onClose: () => { },
};

