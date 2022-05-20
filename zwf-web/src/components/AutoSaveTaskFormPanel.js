import React from 'react';
import PropTypes from 'prop-types';
import { TaskFormWidget } from './TaskFormWidget';
import { saveTaskFields$, saveTaskFieldValues$, subscribeTaskFieldsChange } from 'services/taskService';
import { GlobalContext } from 'contexts/GlobalContext';
import { useDebounce, useDebouncedValue } from "rooks";
import { isEmpty } from 'lodash';

export const AutoSaveTaskFormPanel = React.memo((props) => {

  const { value: task, type, onSavingChange } = props;

  const [fields, setFields] = React.useState(task?.fields);
  const [changedFields, setChangedFields] = React.useState({});
  const [aggregatedChangedFields] = useDebouncedValue(changedFields, 1000);
  const [disabled, setDisabled] = React.useState(false);
  const context = React.useContext(GlobalContext);
  // const [bufferedChangedFields, setBu]
  const ref = React.useRef();

  const role = context.role;

  React.useEffect(() => {
    setFields(task?.fields);
    setDisabled(
      ['done', 'archived'].includes(task.status)
      || (role === 'client' && ['todo', 'in_progress'].includes(task.status))
    )
  }, [task]);

  React.useEffect(() => {
    if (!isEmpty(aggregatedChangedFields)) {
      saveTaskFieldValues$(task.id, aggregatedChangedFields).subscribe(() => {
        setChangedFields({})
        onSavingChange(false);
      });
    }
  }, [aggregatedChangedFields]);

  React.useEffect(() => {
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
      eventSource?.close();
    }
  }, []);

  const updateFieldsWithChangedFields = (changedFields) => {
    setFields(fields => {
      fields.forEach(field => {
        if (field.id in changedFields) {
          field.value = changedFields[field.id];
        }
      })

      return [...fields];
    });
  }

  const handleTaskFieldsValueChange = React.useCallback(changedFields => {
    updateFieldsWithChangedFields(changedFields);
    onSavingChange(true);
    setChangedFields(x => ({ ...x, ...changedFields }))
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

