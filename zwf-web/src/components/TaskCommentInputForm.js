import { EnterOutlined } from '@ant-design/icons';
import { Button, Form, Input, Typography, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import 'react-chat-elements/dist/main.css';
import { addTaskComment$ } from 'services/taskCommentService';
import { finalize } from 'rxjs/operators';

const { Text } = Typography;

export const TaskCommentInputForm = React.memo((props) => {
  const { taskId, loading: propLoading, onDone } = props;

  const [loading, setLoading] = React.useState(propLoading);
  const [form] = Form.useForm();
  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    if (!loading) {
      textareaRef.current?.focus();
    }
  }, [loading]);

  React.useEffect(() => {
    setLoading(propLoading);
  }, [propLoading]);

  const handleSendMessage = (values) => {
    const { message } = values;
    if (!message?.trim()) {
      return;
    }

    setLoading(true)
    addTaskComment$(taskId, message).pipe(
      finalize(() => setLoading(false))
    ).subscribe(() => {
      onDone?.()
      form.resetFields();
      textareaRef.current.focus();
    });
  }

  return <Form onFinish={handleSendMessage}
    form={form}>
    <Form.Item name="message"
    extra="Enter to send"
    style={{marginBottom: 0}}
    >
      <Input.TextArea
        showCount
        autoSize={{ minRows: 3, maxRows: 20 }}
        maxLength={1000}
        placeholder="Comment"
        allowClear
        autoFocus={true}
        disabled={loading}
        onPressEnter={e => handleSendMessage({ message: e.target.value })}
        ref={textareaRef}
      />
    </Form.Item>
    <Form.Item style={{marginBottom: 0}}>
      <Row justify="end" gutter={8} style={{ position: 'relative' }}>
        <Col>
          <Button type="primary" htmlType="submit" disabled={loading}>Send</Button>
        </Col>
      </Row>
    </Form.Item>
  </Form>

});

TaskCommentInputForm.propTypes = {
  taskId: PropTypes.string.isRequired,
  loading: PropTypes.bool,
  onDone: PropTypes.func,
};

TaskCommentInputForm.defaultProps = {
  width: 500,
  loading: false,
  onDone: () => { },
};

