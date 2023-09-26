import { Button, Form, Typography, Row, Col, Mentions, Input } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { createTaskTalkText$ } from 'services/taskCommentService';
import { finalize } from 'rxjs/operators';
import { subscribeMembers } from 'services/memberService';
import { UserNameCard } from './UserNameCard';
import { useRole } from 'hooks/useRole';

const { Text } = Typography;


export const TaskTalkTextInput = React.memo((props) => {
  const { taskId, loading: propLoading, onDone } = props;

  const [loading, setLoading] = React.useState(propLoading);
  const [members, setMembers] = React.useState([]);
  const [form] = Form.useForm();
  const textareaRef = React.useRef(null);
  const role = useRole();

  const isClient = role === 'client';

  React.useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus();
    }
  }, [loading]);

  React.useEffect(() => {
    setLoading(propLoading);
  }, [propLoading]);

  React.useEffect(() => {
    if (!isClient) {
      const sub$ = subscribeMembers(setMembers);
      return () => sub$.unsubscribe();
    }
  }, [])

  const options = React.useMemo(() => {
    return members.map(x => ({
      key: x.id,
      value: x.email.split('@')[0],
      label: <UserNameCard userId={x.id} />,
    }))
  }, [members]);

  const extractMentions = (text) => {
    if (isClient) {
      return [];
    }
    const memberIds = new Set();
    members.forEach(m => {
      const display = `@${m.email.split('@')[0]}`;
      if (text.indexOf(display) > -1) {
        memberIds.add(m.id);
      }
    });

    return Array.from(memberIds);
  }

  const handleSendMessage = (values) => {
    const message = values.message?.trim();
    if (!message) {
      return;
    }

    setLoading(true)
    const memberIds = extractMentions(message);
    createTaskTalkText$(taskId, message, memberIds).pipe(
      finalize(() => setLoading(false))
    ).subscribe(() => {
      onDone?.()
      form.resetFields();
      textareaRef.current.focus();
    });
  }

  return <>
    <Form onFinish={handleSendMessage}
      form={form}>
      <Form.Item name="message"
        style={{ marginBottom: 0 }}
      >
        {isClient ? <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 20 }}
          maxLength={1000}
          placeholder="Enter to send."
          disabled={loading}
          onPressEnter={e => handleSendMessage({ message: e.target.value })}
          ref={textareaRef}
        /> : <Mentions
          autoSize={{ minRows: 3, maxRows: 20 }}
          maxLength={1000}
          placeholder="Enter to send. '@' to mention team member"
          options={options}
          disabled={loading}
          onPressEnter={e => handleSendMessage({ message: e.target.value })}
          ref={textareaRef}
        />}
      </Form.Item>
      <Form.Item style={{ marginTop: 10, marginBottom: 0 }}>
        <Row justify="end" gutter={8} style={{ position: 'relative' }}>
          <Col>
            <Button type="primary" htmlType="submit" disabled={loading}>Send</Button>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  </>
});

TaskTalkTextInput.propTypes = {
  taskId: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  onDone: PropTypes.func,
};

TaskTalkTextInput.defaultProps = {
  width: 500,
  loading: false,
  onDone: () => { },
};

