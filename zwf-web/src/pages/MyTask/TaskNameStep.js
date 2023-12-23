import { Form, Input, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import StepButtonSet from './StepBottonSet';

const { Title } = Typography;

const TaskNameStep = (props) => {
  const { task, onFinish, isActive } = props;

  const handleSubmit = async (values) => {
    onFinish(values.name);
  }

  if (!isActive) {
    return null;
  }

  return <Form
    layout="vertical"
    onFinish={handleSubmit}
    style={{ textAlign: 'left' }}
    initialValues={task}
  >
    <Form.Item
      label={<Title level={4}>Task Name</Title>}
      name="name"
      rules={[{ required: true, message: ' ' }]}
    >
      <Input placeholder="Task Name" autoFocus />
    </Form.Item>
    {/* <Button block type="primary" htmlType="submit">Next</Button> */}
    <StepButtonSet showsBack={false} />
  </Form>
};

TaskNameStep.propTypes = {
  task: PropTypes.any.isRequired,
  disabled: PropTypes.bool.isRequired,
};

TaskNameStep.defaultProps = {
  disabled: false
};

export default withRouter(TaskNameStep);
