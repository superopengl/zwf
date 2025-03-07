import { Drawer, Tabs } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { listTaskComment$ } from 'services/taskService';
import { TaskCommentPanel } from './TaskCommentPanel';
import { HistoryOutlined, MessageOutlined } from '@ant-design/icons';
import { UserNameCard } from './UserNameCard';
import { TaskLogPanel } from './TaskLogPanel';



export const TaskLogAndCommentCommentDrawer = React.memo((props) => {
  const { taskId, userId, visible, onClose, width } = props;

  const handleMessageSent = () => {
    listTaskComment$(taskId).subscribe();
  }

  return <Drawer
    open={visible}
    onClose={onClose}
    title="Log & Comment"
    destroyOnClose={false}
    closable
    autoFocus
    maskClosable
    width={width}
  // bodyStyle={{ padding: 0 }}
  // footer={<TaskMessageForm taskId={taskId} onDone={handleMessageSent} />}
  >
    <UserNameCard userId={userId} size={56} fontSize={18} />
    <Tabs
      destroyInactiveTabPane={true}
      items={[
        {
          key: 'comment',
          label: <div style={{ paddingRight: 16 }}><MessageOutlined /> Comment</div>,
          children: <TaskCommentPanel taskId={taskId} />
        },
        {
          key: 'log',
          label: <div style={{ paddingRight: 16 }}><HistoryOutlined /> Log</div>,
          children: <TaskLogPanel taskId={taskId} />
        }
      ]}
    />
  </Drawer>
});

TaskLogAndCommentCommentDrawer.propTypes = {
  taskId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  width: PropTypes.number,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

TaskLogAndCommentCommentDrawer.defaultProps = {
  width: 500,
  visible: false,
  onClose: () => { },
};

