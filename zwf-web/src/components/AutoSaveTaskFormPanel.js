import React from 'react';
import PropTypes from 'prop-types';
import { updateTaskFields$, saveTaskFieldValues$ } from 'services/taskService';
import { useDebounce, useDebouncedValue } from "rooks";
import { FormSchemaRenderer } from './FormSchemaRenderer';
import { useRole } from 'hooks/useRole';
import { useZevent } from 'hooks/useZevent';
import { finalize } from 'rxjs';
import { Row, Button, Typography } from 'antd';
import { TaskContext } from 'contexts/TaskContext';

const { Text } = Typography

export const AutoSaveTaskFormPanel = React.memo((props) => {

  const { mode, onLoadingChange, autoSave, requiredMark, submitText } = props;

  const { task, setTask } = React.useContext(TaskContext);
  // const [fields, setFields] = React.useState(task?.fields);
  const [changedFields, setChangedFields] = React.useState({});
  const [savingStatus, setSavingStatus] = React.useState();
  const [aggregatedChangedFields] = useDebouncedValue(changedFields, 1000);
  const [disabled, setDisabled] = React.useState(false);
  const role = useRole();
  const ref = React.useRef();

  const isClient = role === 'client';

  const fields = task.fields;

  const handleZevent = z => {
    const { fields: changedFields } = z.payload;
    if (changedFields) {
      updateFieldsWithChangedFields(changedFields);
      ref.current?.setFieldsValue(changedFields)
    }
  };

  useZevent(z => z.type === 'task.fields' && z.taskId === task.id, handleZevent);

  React.useEffect(() => {
    // setFields(task?.fields);
    setDisabled(
      ['done', 'archived'].includes(task.status)
      || (isClient && ['todo'].includes(task.status))
    )
  }, [task]);

  React.useEffect(() => {
    if (!autoSave) {
      return;
    }
    setTask({ ...task, fields });
    setSavingStatus('Saving ...')
    saveTaskFieldValues$(task.id, aggregatedChangedFields)
      .pipe(
        finalize(() => setSavingStatus('Saved'))
      ).subscribe(() => {
        setChangedFields({})
      });
  }, [aggregatedChangedFields]);

  const handleManualSubmit = async () => {
    await ref.current.validateFields();

    saveTaskFieldValues$(task.id, changedFields)
      .pipe(
        finalize(() => onLoadingChange(false))
      ).subscribe(() => {
        setChangedFields({})
      });
  }

  const updateFieldsWithChangedFields = (changedFields) => {
    fields.forEach(field => {
      if (field.id in changedFields) {
        field.value = changedFields[field.id];
      }
    });

  }

  const handleTaskFieldsValueChange = React.useCallback(changedFields => {
    updateFieldsWithChangedFields(changedFields);
    onLoadingChange(true);
    setChangedFields(x => ({ ...x, ...changedFields }))
    setSavingStatus('Unsaved');
  }, []);

  return (<>
    <FormSchemaRenderer
      fields={fields}
      mode={mode}
      ref={ref}
      onChange={handleTaskFieldsValueChange}
      disabled={disabled}
      requiredMark={requiredMark}

    />
    <Row justify="end" style={{ marginTop: 20 }}>
      {autoSave ?
        <Text type="secondary" italic><small>{savingStatus}</small></Text> :
        <Button onClick={handleManualSubmit} type="primary">{submitText}</Button>}
    </Row>
  </>
  );
});

AutoSaveTaskFormPanel.propTypes = {
  value: PropTypes.shape({
    fields: PropTypes.array.isRequired,
  }).isRequired,
  mode: PropTypes.oneOf(['client', 'agent']).isRequired,
  // onChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
  autoSave: PropTypes.bool,
  submitText: PropTypes.string,
};

AutoSaveTaskFormPanel.defaultProps = {
  mode: 'client',
  onLoadingChange: saving => { },
  autoSave: true,
  submitText: 'Submit'
};

