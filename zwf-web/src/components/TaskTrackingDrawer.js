import { EnterOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Form, Input, Drawer } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { listTaskTrackings$, createNewTaskTracking$, subscribeTaskTracking } from 'services/taskService';
import { uniqBy, orderBy } from 'lodash';
import { TaskTrackingPanel } from './TaskTrackingPanel';
import { switchMapTo } from 'rxjs/operators';
import { TaskMessageForm } from './TaskMessageForm';



export const TaskTrackingDrawer = React.memo((props) => {
  const { taskId, visible, onClose, width } = props;

  const [loading, setLoading] = React.useState(true);
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const sub$ = listTaskTrackings$(taskId).subscribe(allMessages => {
      allMessages.forEach(x => {
        x.createdAt = moment.utc(x.createdAt).local().toDate()
      });
      setList(allMessages);
      setLoading(false);
    });

    const eventSource = subscribeTaskTracking(taskId);
    eventSource.onmessage = (message) => {
      const event = JSON.parse(message.data);
      event.createdAt = moment.utc(event.createdAt).local().toDate();
      setList(list => {
        list.push(event);
        return orderBy(uniqBy(list, x => x.id), ['createdAt'], ['asc']);
      });
    }

    return () => {
      sub$?.unsubscribe();
      eventSource?.close();
    }
  }, []);

  const handleMessageSent = () => {
    listTaskTrackings$(taskId).subscribe(setList);
  }

  return <Drawer
    visible={visible}
    onClose={onClose}
    title="Activity History"
    destroyOnClose={false}
    closable
    autoFocus
    maskClosable
    width={width}
    bodyStyle={{ padding: 0 }}
    footer={<TaskMessageForm taskId={taskId} loading={loading} onDone={handleMessageSent} />    }
  >
    <TaskTrackingPanel dataSource={list} />
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

