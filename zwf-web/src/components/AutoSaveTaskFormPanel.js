import React from 'react';
import PropTypes from 'prop-types';
import { updateTaskFields$, saveTaskFieldValues$ } from 'services/taskService';
import { useDebounce, useDebouncedValue } from "rooks";
import { isEmpty } from 'lodash';
import { TaskDocRequireSignBar } from './TaskDocRequireSignBar';
import { TaskSchemaRenderer } from './TaskSchemaRenderer';
import { useAuthUser } from 'hooks/useAuthUser';
import { useRole } from 'hooks/useRole';
import { useSubscribeZevent } from 'hooks/useSubscribeZevent';

export const AutoSaveTaskFormPanel = React.memo((props) => {

  const { value: task, mode, onSavingChange } = props;

  const [fields, setFields] = React.useState(task?.fields);
  const [changedFields, setChangedFields] = React.useState({});
  const [aggregatedChangedFields] = useDebouncedValue(changedFields, 1000);
  const [disabled, setDisabled] = React.useState(false);
  const role = useRole();
  const ref = React.useRef();

  const isClient = role === 'client';

  useSubscribeZevent(zevent => {
    const { fields: changedFields } = zevent.payload;
    updateFieldsWithChangedFields(changedFields);
    ref.current?.setFieldsValue(changedFields)
  }, []);

  React.useEffect(() => {
    setFields(task?.fields);
    setDisabled(
      ['done', 'archived'].includes(task.status)
      || (isClient && ['todo', 'in_progress'].includes(task.status))
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

  const handleSignDoc = () => {

  }

  return (<>
    {isClient && <TaskDocRequireSignBar value={task} onChange={handleSignDoc} />}
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
    name: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    docs: PropTypes.array,
  }).isRequired,
  mode: PropTypes.oneOf(['client', 'agent']).isRequired,
  // onChange: PropTypes.func,
  onSavingChange: PropTypes.func,
};

AutoSaveTaskFormPanel.defaultProps = {
  mode: 'client',
  onSavingChange: saving => { },
};

