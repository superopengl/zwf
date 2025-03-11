import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';


const statusDefs = {
  'todo': {
    label: 'Not Started',
    // color: '#d9d9d9',
    color: 'default',
  },
  'in_progress': {
    label: 'In Progress',
    color: 'processing',
  },
  'action_required': {
    label: 'Action Required',
    color: 'error'
  },
  'done': {
    label: 'Completed',
    color: 'success',
  },
  'archived': {
    label: 'Archived',
    color: '#262626',
  },
}

export const TaskStatusTag = React.memo(props => {
  const { status } = props;
  const def = statusDefs[status];
  return <Tag color={def?.color} style={{ margin: 0 }}>{def?.label || status}</Tag>
});

TaskStatusTag.propTypes = {
  status: PropTypes.string.isRequired,
};

TaskStatusTag.defaultProps = {
}