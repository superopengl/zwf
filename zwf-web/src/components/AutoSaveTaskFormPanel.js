import React from 'react';
import PropTypes from 'prop-types';
import { TaskFormWidget } from './TaskFormWidget';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, switchMapTo, take, tap, throttle, throttleTime } from 'rxjs/operators';
import { saveTaskFields$ } from 'services/taskService';

export const AutoSaveTaskFormPanel = React.memo(React.forwardRef((props, ref) => {

  const { value: task, type, onSavingChange } = props;

  const [fields, setFields] = React.useState(task?.fields);
  const source$ = React.useRef(new Subject());

  React.useEffect(() => {
    setFields(task?.fields);
  }, [task]);

  React.useEffect(() => {
    const sub$ = source$.current.pipe(
      debounceTime(1000),
      switchMap(fields => saveTaskFields$(task.id, fields)),
    ).subscribe(() => {
      onSavingChange(false)
    });

    return () => sub$.unsubscribe();
  }, []);

  const handleTaskFieldsChange = React.useCallback(fields => {
    setFields(fields);
    onSavingChange(true);
    source$.current.next(fields);
  }, []);

  return (
    <TaskFormWidget
      fields={fields}
      docs={task.docs}
      type={type}
      mode="task"
      onChange={handleTaskFieldsChange}
    />
  );
}));

AutoSaveTaskFormPanel.propTypes = {
  value: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
  }).isRequired,
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
  // onChange: PropTypes.func,
  onSavingChange: PropTypes.func,
};

AutoSaveTaskFormPanel.defaultProps = {
  type: 'client',
  onSavingChange: saving => { },
};

