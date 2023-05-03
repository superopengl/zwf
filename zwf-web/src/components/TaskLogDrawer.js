import { Drawer } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { TaskLogPanel } from './TaskLogPanel';

export const TaskLogDrawer = React.memo((props) => {
  const { taskId, visible, onClose, width } = props;

  return <Drawer
    open={visible}
    onClose={onClose}
    title={<>Logs</>}
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
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

TaskLogDrawer.defaultProps = {
  width: 500,
  visible: false,
  onClose: () => { },
};

