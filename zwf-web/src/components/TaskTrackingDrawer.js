import { EnterOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Form, Input, Drawer } from 'antd';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { listTaskTrackings, createNewTaskTracking$, subscribeTaskTracking } from 'services/taskService';
import { uniqBy, orderBy } from 'lodash';
import { TaskTrackingPanel } from './TaskTrackingPanel';
import { switchMapTo } from 'rxjs/operators';



export const TaskTrackingDrawer = React.memo((props) => {
  const { taskId, visible, onClose, width } = props;

  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();
  const textareaRef = React.useRef(null);
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const sub$ = listTaskTrackings(taskId).subscribe(allMessages => {
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

  React.useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus();
    }
  }, [loading]);


  const handleSendMessage = (values) => {
    const { message } = values;
    if (!message?.trim()) {
      return;
    }

    setLoading(true)
    createNewTaskTracking$(taskId, message).pipe(
      switchMapTo(listTaskTrackings(taskId))
    ).subscribe(list => {
      setLoading(false)
      setList(list);
      form.resetFields();
      textareaRef.current.focus();
    });
  }

  return <Drawer
    visible={visible}
    onClose={onClose}
    title="Activity History"
    destroyOnClose
    closable
    autoFocus
    maskClosable
    width={width}
    bodyStyle={{ padding: 0 }}
    footer={
      <>
        <Form onFinish={handleSendMessage}
          form={form}>
          <Form.Item name="message">
            <Input.TextArea
              showCount
              autoSize={{ minRows: 3, maxRows: 20 }}
              maxLength={2000}
              placeholder="Type here and press enter to send"
              allowClear
              autoFocus={true}
              disabled={loading}
              onPressEnter={e => handleSendMessage({ message: e.target.value })}
              ref={textareaRef}
            />
          </Form.Item>
          <Button block type="primary" htmlType="submit" disabled={loading}>Send <EnterOutlined /></Button>
        </Form>
      </>
    }
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

