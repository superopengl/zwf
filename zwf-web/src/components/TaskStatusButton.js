import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Text, Paragraph, Link: TextLink } = Typography;

const definitions = {
  'todo': {
    label: 'To Do',
    color: '#13c2c2',
  },
  'in_progress': {
    label: 'In Progress',
    color: '#1890ff',
  },
  'pending_fix': {
    label: 'Pending Fix',
    color: '#061178',
  },
  'pending_sign': {
    label: 'Pending Sign',
    color: '#f5222d',
  },
  'signed': {
    label: 'Signed',
    color: '#5c0011',
  },
  'done': {
    label: 'Done',
    color: '#52c41a',
  },
  'archived': {
    label: 'Archived',
    color: '#434343',
  },
}



export const TaskStatusButton = props => {
  const { size, onChange, value } = props;

  const handleSelectChange = (e) => {
    const newStatus = e.key;
    onChange(newStatus);
  }

  const menu = <Menu onClick={handleSelectChange} size={size}>
    {Object.keys(definitions).filter(k => k !== value).map(k => <Menu.Item key={k}>{definitions[k].label}</Menu.Item>)}
  </Menu>

  return <Dropdown overlay={menu} size={size}>
    <Button ghost style={{backgroundColor: definitions[value]?.color, width: size === 'small' ? 120 : 140}} size={size}>
      {definitions[value]?.label} <DownOutlined />
    </Button>
  </Dropdown>
};

TaskStatusButton.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.string,
};

TaskStatusButton.defaultProps = {
  onChange: () => {},
  value: 'todo'
};

