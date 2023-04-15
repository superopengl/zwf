import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Typography } from 'antd';
import { notify } from 'util/notify';
import { useWindowHeight } from '@react-hook/window-size'
import { saveBlog } from 'services/blogService';
import { SampleBlog } from './SampleBlog';

const { Paragraph } = Typography;

const EMPTY_BLOG_POST = {
  title: '',
  md: SampleBlog
}

const BlogForm = (props) => {

  const { blog } = props;

  const windowHeight = useWindowHeight();

  const handleSave = async (values) => {
    const { title } = values;
    const newEntity = {
      ...blog,
      ...values
    }
    await saveBlog(newEntity);
    props.onOk();
    notify.success(<>Successfully saved blog <strong>{title}</strong></>)
  }

  return (
    <Form onFinish={handleSave} initialValues={blog || EMPTY_BLOG_POST} style={{ position: 'relative' }}>
      <Form.Item style={{ marginRight: 120 }} name="title" rules={[{ required: true, message: ' ', max: 100 }]}>
        <Input style={{ marginRight: '1rem' }} placeholder="Blog Title" />
      </Form.Item>
      <Button style={{ position: 'absolute', right: 0, top: 0, width: 100 }} htmlType="submit" type="primary">Save</Button>
      <Paragraph type="secondary">
        Refer to <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">https://www.markdownguide.org/basic-syntax/</a> for Markdown basic syntax.
        </Paragraph>
      <Form.Item name="md" rules={[{ required: true, message: ' ' }]}>
        {/* <MarkdownEditor style={{ height: windowHeight - 220 }} */}
        />
      </Form.Item>
    </Form >
  );
};

BlogForm.propTypes = {
  blog: PropTypes.object,
};

BlogForm.defaultProps = {
};

export default withRouter(BlogForm);
