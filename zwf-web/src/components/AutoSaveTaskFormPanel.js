import React from 'react';
import PropTypes from 'prop-types';
import { TaskFormWidget } from './TaskFormWidget';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, switchMapTo, take, tap, throttle, throttleTime } from 'rxjs/operators';
import { saveTaskContent$ } from 'services/taskService';

export const AutoSaveTaskFormPanel = React.memo(React.forwardRef((props, ref) => {

  const { value: task, type, onSavingChange } = props;

  const [fields, setFields] = React.useState(task?.fields);
  const [taskDocIds, setTaskDocIds] = React.useState(task?.docs?.map(x => x.id));
  const source$ = React.useRef(new Subject());

  React.useEffect(() => {
    setFields(task?.fields);
    setTaskDocIds(task?.docs?.map(x => x.id));
  }, [task]);

  React.useEffect(() => {
    const sub$ = source$.current.pipe(
      debounceTime(1000),
      switchMap(({fields, taskDocIds}) => saveTaskContent$(task.id, fields, taskDocIds)),
    ).subscribe(() => {
      onSavingChange(false)
    });

    return () => sub$.unsubscribe();
  }, []);

  const handleTaskContentChange = React.useCallback((fields, taskDocIds) => {
    setFields(fields);
    setTaskDocIds(taskDocIds);
    onSavingChange(true);
    source$.current.next({fields, taskDocIds});
  }, []);

  return (
    <TaskFormWidget
      fields={fields}
      taskDocIds={taskDocIds}
      type={type}
      onChange={handleTaskContentChange}
    />
  );
}));

AutoSaveTaskFormPanel.propTypes = {
  value: PropTypes.shape({
    name: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    docs: PropTypes.array,
  }).isRequired,
  type: PropTypes.oneOf(['client', 'agent']).isRequired,
  // onChange: PropTypes.func,
  onSavingChange: PropTypes.func,
};

AutoSaveTaskFormPanel.defaultProps = {
  type: 'client',
  onSavingChange: saving => { },
};

