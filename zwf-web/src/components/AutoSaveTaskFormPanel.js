import React from 'react';
import PropTypes from 'prop-types';
import { updateTaskFields$, saveTaskFieldValues$ } from 'services/taskService';
import { useDebounce, useDebouncedValue } from "rooks";
import { TaskSchemaRenderer } from './TaskSchemaRenderer';
import { useRole } from 'hooks/useRole';
import { useZevent } from 'hooks/useZevent';
import { finalize } from 'rxjs';

export const AutoSaveTaskFormPanel = React.memo((props) => {

  const { value: task, mode, onSavingChange } = props;

  const [fields, setFields] = React.useState(task?.fields);
  const [changedFields, setChangedFields] = React.useState({});
  const [aggregatedChangedFields] = useDebouncedValue(changedFields, 1000);
  const [disabled, setDisabled] = React.useState(false);
  const role = useRole();
  const ref = React.useRef();

  const isClient = role === 'client';

  const handleZevent = z => {
    const { fields: changedFields } = z.payload;
    if (changedFields) {
      updateFieldsWithChangedFields(changedFields);
      ref.current?.setFieldsValue(changedFields)
    }
  };

  useZevent(z => z.type === 'task.fields' && z.taskId === task.id, handleZevent);

  React.useEffect(() => {
    setFields(task?.fields);
    setDisabled(
      ['done', 'archived'].includes(task.status)
      || (isClient && ['todo', 'in_progress'].includes(task.status))
    )
  }, [task]);

  React.useEffect(() => {
    saveTaskFieldValues$(task.id, aggregatedChangedFields)
      .pipe(
        finalize(() => onSavingChange(false))
      ).subscribe(() => {
        setChangedFields({})
      });
  }, [aggregatedChangedFields]);

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

  return (<>
    <TaskSchemaRenderer
      fields={fields}
      mode={mode}
      ref={ref}
      onChange={handleTaskFieldsValueChange}
      disabled={disabled}
    />
  </>
  );
});

AutoSaveTaskFormPanel.propTypes = {
  value: PropTypes.shape({
    fields: PropTypes.array.isRequired,
  }).isRequired,
  mode: PropTypes.oneOf(['client', 'agent']).isRequired,
  // onChange: PropTypes.func,
  onSavingChange: PropTypes.func,
};

AutoSaveTaskFormPanel.defaultProps = {
  mode: 'client',
  onSavingChange: saving => { },
};

