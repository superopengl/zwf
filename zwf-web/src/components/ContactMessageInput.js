import React from 'react';
import { Button, Form, Input } from 'antd';
import { finalize } from 'rxjs/operators';
import PropTypes from 'prop-types';

export const ContactMessageInput = React.memo(props => {
  const { loading: propLoading, onSubmit } = props;
  const [loading, setLoading] = React.useState(propLoading);
  const [form] = Form.useForm();

  React.useEffect(() => {
    setLoading(propLoading);
  }, [propLoading])

  const handleSubmit = values => {
    if (loading) {
      return;
    }

    setLoading(true);

    const { message } = values;
    onSubmit(message).pipe(
      finalize(() => setLoading(false))
    ).subscribe(() => {
      form.resetFields();
    });
  };

  const handlePressEnter = () => {
    form.submit();
  }

  return <Form form={form} onFinish={handleSubmit} style={{ padding: '10px 16px 0' }}>
    <Form.Item name="message" rules={[{ required: true, message: ' ', whitespace: true, max: 1000 }]}>
      <Input.TextArea
        autoSize={{ minRows: 3 }}
        allowClear={true}
        showCount
        maxLength={1000}
        disabled={loading}
        placeholder="Feedback, bug report, feature request..." 
        onPressEnter={handlePressEnter}
        />
    </Form.Item>
    <Form.Item>
      <Button block type="primary" htmlType="submit" disabled={loading}>Submit</Button>
    </Form.Item>
  </Form>

})

ContactMessageInput.propTypes = {
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func,
};

ContactMessageInput.defaultProps = {
  onSubmit: () => { }
};
