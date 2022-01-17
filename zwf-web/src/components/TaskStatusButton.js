import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

const { Text, Paragraph, Link: TextLink } = Typography;

const definitions = {
  'todo': {
    label: 'To Do',
    color: '#8abcd1',
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
  const { onChange, value } = props;
  const [currentStatus, setCurrentStatus] = React.useState(value);

  const handleSelectChange = (e) => {
    const newStatus = e.key;
    setCurrentStatus(newStatus);
    onChange(newStatus);
  }

  const menu = <Menu onClick={handleSelectChange}>
    {Object.keys(definitions).filter(k => k !== currentStatus).map(k => <Menu.Item key={k}>{definitions[k].label}</Menu.Item>)}
  </Menu>

  return <Dropdown overlay={menu}>
    <Button ghost style={{backgroundColor: definitions[currentStatus]?.color, width: 140}}>
      {definitions[currentStatus]?.label} <DownOutlined />
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

