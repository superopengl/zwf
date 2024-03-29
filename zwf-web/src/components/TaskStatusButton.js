import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Menu, Dropdown, Button, Badge, Select } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Text, Paragraph, Link: TextLink } = Typography;

const definitions = [
  {
    label: 'To Do',
    value: 'todo',
    color: '#d9d9d9',
  },
  {
    label: 'In Progress',
    value: 'in_progress',
    color: '#0FBFC4',
  },
  {
    label: 'Action Required',
    value: 'action_required',
    color: '#cf222e',
  },
  {
    label: 'Completed',
    value: 'done',
    color: '#2da44e',
  },
  {
    label: 'Archived',
    value: 'archived',
    color: '#262626',
  },
]

const options = definitions.map(d => ({
  value: d.value,
  label: <Badge color={d.color} text={d.label} />
}))

export const TaskStatusButton = props => {
  const { onChange, value, ...others } = props;

  return <Select {...others} options={options} value={value} 
  onChange={onChange} dropdownMatchSelectWidth={false}/>
};

TaskStatusButton.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
};

TaskStatusButton.defaultProps = {
  onChange: () => { },
  value: 'todo'
};

