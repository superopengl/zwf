import { Typography, Modal, Divider, Button, Space, Form, Input, Carousel } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import FormBuilder from 'antd-form-builder'
import PropTypes from 'prop-types';
import { PageContainer } from '@ant-design/pro-layout';
import { TaskFormPanel } from '../../components/TaskFormPanel';
import { createNewTask$, getTask$, notifyTask, saveTask } from 'services/taskService';
import { catchError } from 'rxjs/operators';
import { getTaskTemplate$ } from 'services/taskTemplateService';
import { convertTaskTemplateFieldsToFormFieldsSchema } from '../../util/convertTaskTemplateFieldsToFormFieldsSchema';
import ClientAutoComplete from 'components/ClientAutoComplete';
import { TaskIcon, TaskTemplateIcon } from 'components/entityIcon';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import { Loading } from 'components/Loading';
import { notify } from 'util/notify';

const StyledCarousel = styled(Carousel)`
.slick-dots button {
  background-color: #002329 !important;
}
`

const { Title, Paragraph, Text, Link: TextLink } = Typography;

export const NewTaskOnTemplateModal = props => {

  const { taskTemplateId } = props;

  const [loading, setLoading] = React.useState(true);
  const [visible, setVisible] = React.useState(props.visible);
  const [taskTemplate, setTask] = React.useState(props.value);
  const [clientFieldSchema, setClientFieldSchema] = React.useState([]);
  const [agentFieldSchema, setAgentFieldSchema] = React.useState([]);
  const formRef = React.createRef();

  React.useEffect(() => {
    if (!taskTemplateId) {
      setLoading(true);
      return;
    }
    const subscription$ = getTaskTemplate$(taskTemplateId)
      .pipe(
        catchError(() => setLoading(false))
      )
      .subscribe(taskTemplate => {
        setTask(taskTemplate);
        const clientFields = convertTaskTemplateFieldsToFormFieldsSchema(taskTemplate.fields, false);
        clientFields.fields.forEach(f => {
          f.required = false;
        });
        setClientFieldSchema(clientFields);
        const agentFields = convertTaskTemplateFieldsToFormFieldsSchema(taskTemplate.fields, true);
        setAgentFieldSchema(agentFields);
        setLoading(false);
      })

    return () => {
      subscription$.unsubscribe();
    }

  }, [taskTemplateId]);

  React.useEffect(() => {
    setVisible(props.visible);
  }, [props.visible]);

  React.useEffect(() => {
    setLoading(props.loading);
  }, [props.loading]);

  if (!taskTemplate) {
    return null;
  }

  const saveTask = async values => {
    const payload = {
      ...values,
      taskTemplateId
    }

    createNewTask$(payload)
      .subscribe(task => {
        // console.log(task);
        // handleCancelCreateTask();
        notify.success('Created task', <>Successfully created task <TextLink target="_blank" href={`/task/${task.id}`}>{task.name}</TextLink></>, 20);
      })
  }

  const handlCreateTask = async () => {
    let values;
    try {
      values = await formRef.current.validateFields();
    } catch {
      // validation errors
      return;
    }

    setLoading(true);
    await saveTask(values);
    props.onOk();
  }

  const handleFormReset = () => {
    formRef.current.resetFields();
  }

  const handlCreateAndAnother = async () => {
    try {
      const currentFormRef = formRef.current;
      const values = await currentFormRef.validateFields();
      setLoading(true);
      await saveTask(values);
      currentFormRef.resetFields();
    } catch {
      // validation errors
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      visible={visible}
      closable={!loading}
      destroyOnClose
      maskClosable={false}
      title={<><TaskIcon /> Create task</>}
      onCancel={props.onCancel}
      onOk={props.onOk}
      footer={<Space style={{ width: '100%', justifyContent: 'space-between', paddingTop: 8, paddingBottom: 8 }}>
        <Button disabled={loading} onClick={handleFormReset}>Reset</Button>
        <Space>
          <Button disabled={loading} type="text" onClick={props.onCancel}>Cancel</Button>
          <Button disabled={loading} type="primary" ghost onClick={handlCreateAndAnother}>Create Task & Another</Button>
          <Button disabled={loading} type="primary" onClick={handlCreateTask}>Create Task</Button>
        </Space>
      </Space>}
      width={600}
    >
      <Loading loading={loading}>
        <Title type="success" level={3}>{taskTemplate.name}</Title>
        <Form
          ref={formRef}
          // onFinish={handleFormFinish}
          layout="vertical"
          colon={false}
        // initialValues={{ name: taskTemplate.name }}
        >
          <Form.Item label="Task name" name="taskName" rules={[{ required: true, message: ' ' }]}>
            <Input />
          </Form.Item>
          {/* <Form.Item label="Task template" name="taskTemplateId">
          <TaskTemplateSelect />
        </Form.Item> */}
          <Form.Item label="client" name="clientEmail" rules={[{ required: true, message: ' ' }]}>
            <ClientAutoComplete />
          </Form.Item>

          <Title level={5} type="secondary" style={{ marginTop: 40 }}>Client fields</Title>
          <Divider style={{ marginTop: 4 }} />
          <FormBuilder meta={clientFieldSchema} form={formRef} />
          {agentFieldSchema.length > 0 && <>
            <Title level={5} type="secondary" style={{ marginTop: 40 }}>Official only fields</Title>
            <Divider style={{ marginTop: 4 }} />
            <FormBuilder meta={agentFieldSchema} form={formRef} />
          </>}
        </Form>
      </Loading>
    </Modal >
  );
};

NewTaskOnTemplateModal.propTypes = {
  taskTemplateId: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

NewTaskOnTemplateModal.defaultProps = {
  visible: false,
};

export default withRouter(NewTaskOnTemplateModal);
