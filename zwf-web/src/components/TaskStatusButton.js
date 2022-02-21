import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Menu, Dropdown, Button, Badge, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Text, Paragraph, Link: TextLink } = Typography;

const definitions = [
  {
    label: 'To Do',
    value: 'todo',
    color: 'rgba(0,0,0,0.15)',
  },
  {
    label: 'In Progress',
    value: 'in_progress',
    color: '#1890ff',
  },
  {
    label: 'Pending Fix',
    value: 'pending_fix',
    color: '#061178',
  },
  {
    label: 'Pending Sign',
    value: 'pending_sign',
    color: '#f5222d',
  },
  {
    label: 'Signed',
    value: 'signed',
    color: '#5c0011',
  },
  {
    label: 'Done',
    value: 'done',
    color: '#52c41a',
  },
  {
    label: 'Archived',
    value: 'archived',
    color: '#434343',
  },
]

const options = definitions.map(d => ({
  value: d.value,
  label: <Badge color={d.color} text={d.label} />
}))

export const TaskStatusButton = props => {
  const { onChange, value, style, ...others } = props;

  return <Select style={{...style, width: 150}} {...others} options={options} value={value} onChange={onChange} />
};

TaskStatusButton.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
};

TaskStatusButton.defaultProps = {
  onChange: () => { },
  value: 'todo'
};

