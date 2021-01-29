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
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Form
        layout="vertical"
        onFinish={handleSave}
        // onValuesChange={handleFormValueChange}
        initialValues={entity}
        form={form}
      >
        <Form.Item label="Task Template Name" name="name" rules={[{ required: true, message: ' ', whitespace: true, max: 100 }]}>
          <Input placeholder="Task Template Name" />
        </Form.Item>
        {/* <Form.Item label="Upload documents is required?" name="hasUploadDocs" valuePropName="checked">
          <Checkbox>Upload documents is required?</Checkbox>
        </Form.Item> */}
        {/* <Form.Item label="Has documents to sign?" name="hasSignDocs" valuePropName="checked">
          <Checkbox>Has documents to sign?</Checkbox>
        </Form.Item> */}
        {/* <Form.Item label="Has feedback documents?" name="hasFeedbackDocs" valuePropName="checked">
          <Checkbox>Has feedback documents?</Checkbox>
        </Form.Item> */}
        <Form.Item label="Doc Templates to Apply" name="docTemplateIds">
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            placeholder="Doc Templates to apply"
          >
            {docTemplateOptions.map((x, i) => (<Select.Option key={i} value={x.id}>{x.name}</Select.Option>))}
          </Select>
        </Form.Item>
        <Form.Item label="Fields" name="fields">
          <FieldEditor loading={loading}/>
        </Form.Item>
        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>

            <Button type="link" onClick={handleClose}>Cancel</Button>
            <Button type="primary" htmlType="submit">Save</Button>
          </Space>
        </Form.Item>
      </Form>
    </Space>
  );
};

TaskTemplateForm.propTypes = {
  id: PropTypes.string,
};

TaskTemplateForm.defaultProps = {
};

export default withRouter(TaskTemplateForm);
