import React from 'react';
import PropTypes from 'prop-types';
import { TaskFormWidget } from './TaskFormWidget';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, finalize, switchMap, switchMapTo, take, tap, throttle, throttleTime } from 'rxjs/operators';
import { saveTaskFields$, subscribeTaskFieldsChange } from 'services/taskService';
import { GlobalContext } from 'contexts/GlobalContext';

export const AutoSaveTaskFormPanel = React.memo((props) => {

  const { value: task, type, onSavingChange } = props;

  const [fields, setFields] = React.useState(task?.fields);
  const [disabled, setDisabled] = React.useState(false);
  const source$ = React.useRef(new Subject());
  const context = React.useContext(GlobalContext);
  // const [bufferedChangedFields, setBu]
  const ref = React.useRef()
  const role = context.role;

  React.useEffect(() => {
    setFields(task?.fields);
    setDisabled(
      ['done', 'archived'].includes(task.status)
      || (role === 'client' && ['todo', 'in_progress'].includes(task.status))
    )
  }, [task]);

  React.useEffect(() => {
    const sub$ = source$.current.pipe(
      debounceTime(1000),
      switchMap(({ fields }) => saveTaskFields$(task.id, fields)),
    ).subscribe(() => {
      onSavingChange(false)
    });

    // Subscribe task content change events
    const eventSource = subscribeTaskFieldsChange(task.id)
    eventSource.onmessage = (message) => {
      const event = JSON.parse(message.data);
      const { fields: changedFields } = event;
      updateFieldsWithChangedFields(changedFields);

      // Manually set from values based on the content change events
      ref.current?.setFieldsValue(changedFields)
    }

    return () => {
      sub$?.unsubscribe();
      eventSource?.close();
    }
  }, []);

  const updateFieldsWithChangedFields = (changedFields) => {
    setFields(fields => {
      fields.forEach(field => {
        if(field.id in changedFields) {
          field.value = changedFields[field.id];
        }
      })

      return [...fields];
    });
  }

  const handleTaskFieldsValueChange = React.useCallback(changedFields => {
    updateFieldsWithChangedFields(changedFields);
    onSavingChange(true);
    source$.current.next({ fields: changedFields });
  }, []);

  return (
    <>
    <TaskFormWidget
      fields={fields}
      type={type}
      ref={ref}
      onChange={handleTaskFieldsValueChange}
      disabled={disabled}
    />
    </>
  );
});

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

