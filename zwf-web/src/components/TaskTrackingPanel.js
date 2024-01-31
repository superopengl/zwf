import { MessageFilled, MessageOutlined, SendOutlined } from '@ant-design/icons';
import { Button, Form, Input, Timeline, Space, Typography, Card } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { listTaskTrackings, createNewTaskTracking$, subscribeTaskTracking } from 'services/taskService';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { uniqBy, orderBy } from 'lodash';
import { getPublicFileUrl } from 'services/fileService';
import { TimeAgo } from './TimeAgo';
import { UserNameCard } from './UserNameCard';

const { Text, Paragraph } = Typography

const Container = styled.div`
// background-color: rgba(0,0,0,0.05);
// margin-left: 16px;
// border-left: 1px solid rgba(0, 0, 0, 0.06) ;
// padding-left: 16px;

// min-width: 400px;
.message-list {
  display: flex;
  flex-direction: column-reverse;
  overflow-x: hidden;
  overflow-y: hidden;
}

.rce-mbox {
  padding-bottom: 2rem;
  box-shadow: none;

  .rce-mbox-text {
    white-space: pre-line;
  }

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;

const StyledSentMessageBox = styled(MessageBox)`
.rce-mbox {
  margin-right: 0;
  background-color:#95de64;
  margin-left: 20px;
  // color: rgba(255,255,255,0.9);

  .rce-mbox-time {
    // color: rgba(255,255,255,0.7);
  }
}
`;

const StyledReceivedMessageBox = styled(MessageBox)`
.rce-mbox {
  margin-left: 0;
  margin-right: 20px;
  background-color: #f0f0f0;
  // color: rgba(255,255,255,0.9);
}
`;

const SentMessage = (props) => <StyledSentMessageBox {...props} position="right" />

const ReceivedMessage = (props) => <StyledReceivedMessageBox {...props} position="left" />

const ChatMessage = props => {
  const { userId, message } = props;
  const context = React.useContext(GlobalContext);
  const isMe = userId === context.user.id;

  return <Card
    size="small"
    bordered={true}
    style={{
      marginBottom: 4,
      backgroundColor: isMe ? '#66c18c' : 'rgb(245,245,245)',
    }}>
    <Space style={{ width: '100%', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
      <UserNameCard userId={userId} showName={false} showTooltip={true} />
      {message}
    </Space>
  </Card>

}

export const TaskTrackingPanel = React.memo((props) => {
  const { taskId, currentUserId, readonly } = props;

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

  const handleSendMessage = (values) => {
    const { message } = values;
    if (!message?.trim()) {
      return;
    }

    const messageId = uuidv4();
    const newMessage = {
      id: messageId,
      createdAt: new Date(),
      by: currentUserId,
      info: message,
      action: 'chat',
      status: 'waiting',
    };

    createNewTaskTracking$(taskId, messageId, message).subscribe(() => {
      setList(list => list.map(x => x.id === messageId ? { ...x, status: 'sent' } : x));
    })

    setList([ ...list, newMessage]);

    form.resetFields();
    textareaRef.current.focus();
  }

  return <Container>
    <Timeline mode="left">
      {list.map(item => <Timeline.Item
        key={item.id}
        color={item.action === 'chat' ? (item.by === currentUserId ? 'green' : 'blue') : 'gray'}
        // position={item.action === 'chat' && item.by === currentUserId ? 'left' : 'right'}
        dot={item.action === 'chat' ? <MessageFilled /> : null}
      // label={<TimeAgo value={item.createdAt} accurate={false} direction="horizontal" />}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {item.action === 'chat' ? <ChatMessage userId={item.by} message={item.info} /> : <Text>{item.action ?? item.info}</Text>}
          <TimeAgo value={item.createdAt} accurate={false} direction="horizontal" />
        </div>
      </Timeline.Item>
      )}
    </Timeline>
    <div style={{ padding: '16px 0' }}>
      {readonly ? null : <Form onFinish={handleSendMessage}
        form={form}>
        <Form.Item name="message" style={{ marginBottom: 4 }}>
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
        {/* <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => handleGoBack()}></Button>
      </Space> */}
        <Button type="primary" block icon={<SendOutlined />} htmlType="submit" disabled={loading} >Send</Button>
      </Form>}
    </div>
  </Container>
});

TaskTrackingPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  readonly: PropTypes.bool.isRequired,
};

TaskTrackingPanel.defaultProps = {
  readonly: false
};

