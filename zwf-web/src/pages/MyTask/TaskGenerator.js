
import React from 'react';
import { Space, Typography, Button, Steps, Tabs, Divider, Row, Input } from 'antd';
import { Loading } from 'components/Loading';
import PropTypes from 'prop-types';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import { ClientSelect } from 'components/ClientSelect';
import { getTaskTemplate$ } from 'services/taskTemplateService';
import { catchError, finalize, mapTo, tap, window } from 'rxjs/operators';
import { RightOutlined } from '@ant-design/icons';
import { createNewTask$ } from 'services/taskService';
import { DocTemplateListPanel } from 'components/DocTemplateListPanel';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import Icon from '@ant-design/icons';
import { MdOpenInNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName } from 'util/getUserDisplayName';

const { Text, Link: TextLink } = Typography;

const StyledDescription = props => <div style={{ marginTop: '0.5rem' }}><Text type="secondary">{props.value}</Text></div>

export const TaskGenerator = React.memo(props => {
  const {client} = props;
  const [taskTemplateId, setTaskTemplateId] = React.useState(props.taskTemplateId);
  const [clientInfo, setClientInfo] = React.useState(client);
  const [taskName, setTaskName] = React.useState();
  const [taskTemplate, setTaskTemplate] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (taskTemplateId) {
      getTaskTemplate$(taskTemplateId)
        .pipe(
          catchError(() => setLoading(false))
        )
        .subscribe(taskTemplate => {
          setTaskTemplate(taskTemplate)
          setLoading(false)
        });
    } else {
      setTaskTemplate(null)
    }
  }, [taskTemplateId])

  React.useEffect(() => {
    if (clientInfo && taskTemplate) {
      const userName = getUserDisplayName(clientInfo.email, clientInfo.givenName, clientInfo.surname);
      const name = `${taskTemplate.name} - ${userName}`;
      setTaskName(name);
    }
  }, [clientInfo, taskTemplate])

  const handleTaskTemplateChange = taskTemplateIdValue => {
    setTaskTemplateId(taskTemplateIdValue);
  }

  const handleClientChange = (clientEmmail, client) => {
    setClientInfo(client);
  }

  const handleNameEnter = (e) => {
    const name = e.target.value?.trim();
    setTaskName(name);
  }
  const handleCreateEmptyTask = () => {
    createTaskWithVarBag$().subscribe(task => {
      const notifyHandler = notify.success('Task created', <>
        Successfully created task <TextLink
          onClick={() => {
            notifyHandler.close()
            navigate(`/task/${task.id}`)
          }}>
          <Icon component={MdOpenInNew } /> {task.name}
        </TextLink>
      </>);
      props.onCreated(task)
    });
  }


  const createTaskWithVarBag$ = () => {
    const id = uuidv4();
    const payload = {
      id,
      clientEmail: clientInfo.email,
      taskTemplateId,
      taskName,
    };

    setLoading(true);
    return createNewTask$(payload).pipe(
      finalize(() => setLoading(false)),
      mapTo({ id, name: taskName })
    )
  }

  const handleCreateAndEdit = () => {
    createTaskWithVarBag$().subscribe(task => {
      props.onCreated(task)
      navigate(`/task/${task.id}`)
    });
  }

  return (
    <Loading loading={loading}>
      <Space direction='vertical' style={{ width: '100%', marginTop: 20 }} size="large">
        <Space size="middle" direction="vertical" style={{ width: '100%' }}>
          <StyledDescription value="Choose existing client or type in a new client's email address." />
          <ClientSelect style={{ width: '100%' }}
            valueProp="email"
            onChange={handleClientChange}
            onLoadingChange={setLoading}
            value={clientInfo?.email} />
          <StyledDescription value="Choose a task template to begin with." />
          <TaskTemplateSelect style={{ width: '100%' }} onChange={handleTaskTemplateChange} showIcon={true} value={taskTemplateId} />
          {/* {taskTemplate?.docs.length > 0 && <>
            <StyledDescription value="Associated docs that will be auto-generated based on the form fields." />
            <DocTemplateListPanel value={taskTemplate.docs} />
          </>} */}
          {/* <StyledDescription value="Input a meaningful task name. This name will appear in the emails to the client." />
          <Input style={{ height: 50 }}
            placeholder="Task name"
            onPressEnter={handleNameEnter}
            value={taskName}
            onChange={e => setTaskName(e.target.value)} /> */}
        </Space>
        {/* <Divider style={{ margin: '10px 0' }} /> */}
        {/* <Button block icon={<LeftOutlined />} disabled={current === 0} onClick={() => setCurrent(x => x - 1)}></Button> */}
        {/* <Button block icon={<RightOutlined />} disable={current === steps.length - 1} onClick={() => setCurrent(x => x + 1)}></Button> */}
        <Row justify='space-between'>
          <Button type="text" onClick={props.onCancel}>Cancel</Button>
          <Space>
            {/* <Button type="primary"
              disabled={!clientInfo || !taskTemplate || !taskName}
              onClick={handleCreateEmptyTask}>Create Empty Task</Button> */}
            <Button type="primary" 
              disabled={!clientInfo}
              onClick={handleCreateAndEdit}
            >Create Task</Button>
          </Space>
        </Row>
      </Space>
    </Loading>
  );
});


TaskGenerator.propTypes = {
  taskTemplateId: PropTypes.string,
  client: PropTypes.object,
  onCancel: PropTypes.func,
  onCreated: PropTypes.func,
};

TaskGenerator.defaultProps = {
  onCancel: () => { },
  onCreated: () => { },
};