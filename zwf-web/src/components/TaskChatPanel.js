import { SendOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import * as moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { listTaskMessages, sendTaskMessage$, subscribeTaskMessage } from 'services/taskService';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { uniqBy, orderBy } from 'lodash';
import { getPublicFileUrl } from 'services/fileService';

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

export const TaskChatPanel = React.memo((props) => {
  const { taskId, currentUserId, readonly } = props;

  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();
  const textareaRef = React.useRef(null);
  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    const subLoad$ = listTaskMessages(taskId).subscribe(allMessages => {
      allMessages.forEach(x => {
        x.createdAt = moment.utc(x.createdAt).local().toDate()
      });
      setList(allMessages);
      setLoading(false);
    });

    const eventSource = subscribeTaskMessage(taskId);
    eventSource.onmessage = (message) => {
      const event = JSON.parse(message.data);
      event.createdAt = moment.utc(event.createdAt).local().toDate();
      setList(list => {       
        list.push(event);
        return orderBy(uniqBy(list, x => x.id), ['createdAt'], ['desc']);
      });
    }

    return () => {
      subLoad$?.unsubscribe();
      eventSource?.close();
    }
  }, []);

  const sendMessage = (values) => {
    const { message } = values;
    if (!message?.trim()) {
      return;
    }

    const messageId = uuidv4();
    const newMessage = {
      id: messageId,
      createdAt: new Date(),
      senderId: currentUserId,
      message
    };

    const others = [...list];

    sendTaskMessage$(taskId, messageId, message).subscribe(() => {
      setList(list => list.map(x => x.id === messageId ? { ...x, status: 'sent' } : x));
    })

    setList([{ ...newMessage, status: 'waiting' }, ...others]);

    form.resetFields();
    textareaRef.current.focus();
  }

  return <Container>
    <div className="message-list" style={{ padding: '0 0 16px', verticalAlign: 'bottom' }}>
      {list.map(item => {
        const MessageComponent = item.senderId === currentUserId ? SentMessage : ReceivedMessage;
        return <MessageComponent
            key={item.id}
            // avatar={getPublicFileUrl(item.avatarFileId)}
            type="text"
            text={item.message}
            date={moment.utc(item.createdAt).local().toDate()}
            status={item.status || 'sent'} // waiting, sent, received, read
            notch={false}
          />
      })}
    </div>
    <div style={{ padding: '16px 0' }}>
      {readonly ? null : <Form onFinish={sendMessage}
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
            onPressEnter={e => sendMessage({ message: e.target.value })}
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

TaskChatPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  readonly: PropTypes.bool.isRequired,
};

TaskChatPanel.defaultProps = {
  readonly: false
};

