import { Drawer, Tabs, Space } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { listTaskComment$ } from 'services/taskService';
import { TaskCommentPanel } from './TaskCommentPanel';
import { TaskMessageForm } from './TaskMessageForm';
import { CommentOutlined, HistoryOutlined } from '@ant-design/icons';
import { GlobalContext } from 'contexts/GlobalContext';
import { UserNameCard } from './UserNameCard';
import { TaskLogPanel } from './TaskLogPanel';



export const TaskTrackingDrawer = React.memo((props) => {
  const { taskId, visible, onClose, width } = props;
  const context = React.useContext(GlobalContext);

  const { user } = context;
  const { email, avatarFileId, loginType } = user;

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
    footer={<TaskMessageForm taskId={taskId} onDone={handleMessageSent} />}
  >
    <UserNameCard userId={user.id} size={64} />
    <Tabs
      destroyInactiveTabPane={true}
      items={[
        {
          key: 'log',
          label: <><HistoryOutlined /> Log</>,
          children: <TaskLogPanel taskId={taskId} />
        },
        {
          key: 'comment',
          label: <><CommentOutlined /> Comment</>,
          children: <TaskCommentPanel taskId={taskId} />
        }
      ]}
    />
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

