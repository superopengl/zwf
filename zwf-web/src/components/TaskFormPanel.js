import React from 'react';
import PropTypes from 'prop-types';
import { TaskFormWidget } from './TaskFormWidget';

export const TaskFormPanel = React.memo(React.forwardRef((props, ref) => {

  const { value: task, type, onChange } = props;

  if (!task) {
    return null;
  }

  return (
    <>
      <TaskFormWidget
        ref={ref}
        fields={task.fields}
        docs={task.docs}
        type={type}
        mode="task"
        onChange={onChange}
      />
    </>
  );
}));

TaskFormPanel.propTypes = {
  value: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
  }),
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
  onChange: PropTypes.func,
};

TaskFormPanel.defaultProps = {
  type: 'client',
  loading: true,
};

