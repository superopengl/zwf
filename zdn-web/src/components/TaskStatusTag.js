import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';


const statusDefs = {
  'todo': {
    label: 'Action required',
    color: '#cd201f'
  },
  'to_sign': {
    label: 'Sign required',
    color: '#cd201f',
  },
  'signed': {
    label: 'In progress',
    color: 'blue',
  },
  'complete': {
    label: 'Completed',
    color: 'green',
  },
  'archive': {
    label: 'Closed',
    color: '',
  },
}

export const TaskStatusTag = React.memo(props => {
  const { status } = props;
  const def = statusDefs[status];
  return <Tag color={def.color}>{def.label}</Tag>
});

TaskStatusTag.propTypes = {
  status: PropTypes.string.isRequired,
};

TaskStatusTag.defaultProps = {
}