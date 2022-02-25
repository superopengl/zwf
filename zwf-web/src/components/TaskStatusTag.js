import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';


const statusDefs = {
  'todo': {
    label: 'Not Started',
    color: '#d9d9d9',
  },
  'in_progress': {
    label: 'In Progress',
    color: '#37AFD2',
  },
  'action_required': {
    label: 'Action Required',
    color: '#cd201f'
  },
  'done': {
    label: 'Completed',
    color: '#73d13d',
  },
  'archived': {
    label: 'Archieved',
    color: '#262626',
  },
}

export const TaskStatusTag = React.memo(props => {
  const { status } = props;
  const def = statusDefs[status];
  return <Tag color={def?.color}>{def?.label || status}</Tag>
});

TaskStatusTag.propTypes = {
  status: PropTypes.string.isRequired,
};

TaskStatusTag.defaultProps = {
}