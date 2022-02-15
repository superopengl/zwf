import React from 'react';
import PropTypes from 'prop-types';
import { TaskFormWidget } from './TaskFormWidget';

export const TaskFormPanel = React.memo(React.forwardRef((props, formRef) => {

  const { value: task, type } = props;

  if (!task) {
    return null;
  }

  const handleFormSave = (values) => {
    props.onSave(values);
  }

  return (
    <>
      <TaskFormWidget 
      fields={task.fields}
      docs={task.docs}
      type={type}
      mode="task"
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
  onSave: PropTypes.func.isRequired,
  onChangeLoading: PropTypes.func,
};

TaskFormPanel.defaultProps = {
  type: 'client',
  loading: true,
  onSave: () => { debugger; },
  onChangeLoading: () => {}
};

