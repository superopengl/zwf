import { List } from 'antd';
import { Button, Form, Input, Typography, Space } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { GlobalContext } from 'contexts/GlobalContext';
import PropTypes from 'prop-types';
import React from 'react';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { withRouter } from 'react-router-dom';
import { ChatService } from 'services/ChatService';
import styled from 'styled-components';
import { listTaskComments, addTaskComment } from '../../services/taskService';

const { Text, Paragraph } = Typography;

const Container = styled.div`
min-width: 200px;

.ant-list-split .ant-list-item {
  border: none;
}

.ant-list-item {
  padding: 0;
}
`;


const TaskCommentPanel = (props) => {
  const { taskId } = props;
  // const { name, id, fields } = value || {};

  const context = React.useContext(GlobalContext);
  const [loading, setLoading] = React.useState(true);
  const [form] = Form.useForm();
  const textareaRef = React.useRef(null);
  const [list, setList] = React.useState([]);
  const ws = React.useRef(null);

  React.useEffect(() => {
    loadList();
    ws.current = new ChatService(`${taskId}-comment`);
    ws.current.open();

    return () => {
      ws.current.close();
    }
  }, []);

  React.useEffect(() => {
    if (!ws.current) return;
    ws.current.onReceiveMessage = item => {
      setList([{ ...item }, ...list]);
    }
  });


  const loadList = async () => {
    setLoading(true);
    const list = await listTaskComments(taskId);
    setList(list);
    setLoading(false);
  }

    const myUserId = context.user.id;
    const sendMessage = async (values) => {
    const { content } = values;
    form.resetFields();
    if (!content?.trim()) return;

    const newMessage = {
      content,
      createdAt: new Date(),
      senderId: myUserId,
      givenName: context.user.givenName,
      surname: context.user.surname,
    };

    const others = [...list];
    setList([...others, newMessage]);
    ws.current.send(newMessage);
    await addTaskComment(taskId, content);

    form.resetFields();
    textareaRef.current.focus();
  }

  const getAvatarValue = comment => {
    const { givenName, surname } = comment;
    return `${givenName} ${surname}${myUserId === comment.senderId ? ' (me)' : ''}`;
  }

  return <Container>
    <List
      size="small"
      itemLayout="horizontal"
      dataSource={list}
      bordered={false}
      renderItem={item => (
        <List.Item>
          <List.Item.Meta
            // avatar={<PortfolioAvatar id={item.senderId} value={getAvatarValue(item)} size={30} />}
            title={<Space><Text strong>{getAvatarValue(item)}</Text><TimeAgo value={item.createdAt} accurate={false} /></Space>}
            description={<Paragraph >{item.content}</Paragraph>}
          />
        </List.Item>
      )}
    />
    <div style={{ padding: '16px 0' }}>
      <Form onFinish={sendMessage}
        form={form}>
        <Form.Item name="content" style={{ marginBottom: 4 }}>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 20 }}
            maxLength={2000}
            placeholder="Type here and press enter to send"
            allowClear
            autoFocus={true}
            disabled={loading}
            onPressEnter={e => sendMessage({ content: e.target.value })}
            ref={textareaRef}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" disabled={loading} >Add Comment</Button>
      </Form>
    </div>
  </Container>
};

TaskCommentPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskCommentPanel.defaultProps = {
};

export default withRouter(TaskCommentPanel);
