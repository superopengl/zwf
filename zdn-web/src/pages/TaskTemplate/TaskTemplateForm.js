import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Input, Space, Select, Form, Button } from 'antd';
import { saveTaskTemplate, getTaskTemplate } from 'services/taskTemplateService';
import { notify } from 'util/notify';
import FieldEditor from 'components/FieldEditor';
import { listDocTemplate } from 'services/docTemplateService';
import * as _ from 'lodash';
import { Loading } from 'components/Loading';
import { TaskTemplateBuilder } from 'components/formBuilder/TaskTemplateBuilder';

const DEFAULT_ENTITY = {
  docTemplateIds: [],
  fields: []
}

const TaskTemplateForm = (props) => {

  const { id } = props;

  const [loading, setLoading] = React.useState(true);
  const [entity, setEntity] = React.useState(DEFAULT_ENTITY);
  const [form] = Form.useForm();
  const [docTemplateOptions, setDocTemplateOptions] = React.useState([]);
  const [formSchema, setFormSchema] = React.useState({});

  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const entity = await getTaskTemplate(id);
      setEntity(entity);
    }

    const docTemps = await listDocTemplate();
    setDocTemplateOptions(_.sortBy(docTemps, ['name']));

    setLoading(false);
  }

  const initialLoadEntity = React.useCallback(() => loadEntity(), []);

  React.useEffect(() => {
    initialLoadEntity();
  }, [])

  const handleSave = async values => {
    const entityToSave = {
      ...entity,
      ...values,
    }
    await saveTaskTemplate(entityToSave);
    await loadEntity();
    props.onOk();
    notify.success(<>Successfully saved task template <strong>{values.name}</strong></>)
  }

  const handleClose = () => {
    props.onClose();
  }

  if (loading) {
    return <Loading />
  }

  return (
      <TaskTemplateBuilder
        formStructure={formSchema}
        onChange={schema => {
          // onSave form schema received here.
          setFormSchema(schema);
        }}
        onError={error => console.log(error)}
      />
  );
};

TaskTemplateForm.propTypes = {
  id: PropTypes.string,
};

TaskTemplateForm.defaultProps = {
};

export default withRouter(TaskTemplateForm);
