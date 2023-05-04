
import React from 'react';
import { Space, Typography, Button, Form, Radio, Progress, Row, Input, InputNumber, Select } from 'antd';
import { Loading } from 'components/Loading';
import PropTypes from 'prop-types';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import { getTaskTemplate$ } from 'services/taskTemplateService';
import { catchError, finalize, mapTo, tap, window } from 'rxjs/operators';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { createNewTask$ } from 'services/taskService';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import Icon from '@ant-design/icons';
import { MdOpenInNew } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName } from 'util/getUserDisplayName';
import { OrgClientSelect } from 'components/OrgClientSelect';
import {
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormDatePicker,
  ProFormDateRangePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from '@ant-design/pro-components';
import { RecurringForm } from 'pages/Recurring/RecurringForm';
import { DatePicker } from 'antd';
import { RecurringPeriodInput } from 'components/RecurringPeriodInput';

const { Text, Link: TextLink, Paragraph } = Typography;

const StyledDescription = props => <Paragraph type="secondary">{props.value}</Paragraph>

export const TaskGenerator = React.memo(props => {
  const { client, postCreateMode } = props;
  const [taskTemplateId, setTaskTemplateId] = React.useState(props.taskTemplateId);
  const [clientInfo, setClientInfo] = React.useState(client);
  const [startMode, setStartMode] = React.useState('now');
  const [recurringMode, setRecurringMode] = React.useState('once');
  const [taskName, setTaskName] = React.useState();
  const [taskTemplate, setTaskTemplate] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const navigate = useNavigate();
  const formRef = React.useRef();

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
      const name = `${taskTemplate.name} - ${clientInfo.clientAlias}`;
      setTaskName(name);
    }
  }, [clientInfo, taskTemplate])

  const handleTaskTemplateChange = taskTemplateIdValue => {
    setTaskTemplateId(taskTemplateIdValue);
    next();
  }

  const handleClientChange = (client) => {
    setClientInfo(client);
    next();
  }

  const handleNameEnter = (e) => {
    const name = e.target.value?.trim();
    setTaskName(name);
    next();
  }

  const disabledPastDate = (current) => {
    // Can not select days before today and today
    return current && current.endOf('day').isBefore();
  };

  const createTaskWithVarBag$ = () => {
    const id = uuidv4();
    const payload = {
      id,
      clientId: clientInfo.id,
      taskTemplateId,
      taskName,
    };

    setLoading(true);
    return createNewTask$(payload).pipe(
      finalize(() => setLoading(false)),
    )
  }

  const handleRecurringChange = (recurring) => {

  }

  const handleCreateAndEdit = () => {
    createTaskWithVarBag$().subscribe(task => {
      props.onCreated(task)
      if (postCreateMode === 'notify') {
        const notice = notify.success(
          'Successfully created task',
          <Text>Task <TextLink strong onClick={() => {
            notice.close();
            navigate(`/task/${task.id}`);
          }}>{task.name}</TextLink> was created</Text>,
          15
        );
      } else if (postCreateMode === 'navigate') {
        navigate(`/task/${task.id}`)
      }
    });
  }

  const steps = [
    {
      title: 'Client',
      content: <>
        <StyledDescription value="Choose existing client or type in a new client's email address." />
        <OrgClientSelect style={{ width: '100%' }}
          onChange={handleClientChange}
          onLoadingChange={setLoading}
          value={clientInfo?.id} />
      </>,
      canNext: () => !!client,
    },
    {
      title: 'From template',
      content: <>
        <StyledDescription value="Choose a task template to begin with." />
        <TaskTemplateSelect style={{ width: '100%' }} onChange={handleTaskTemplateChange} showIcon={true} value={taskTemplateId} />
      </>,
    },
    {
      title: 'Start',
      content: <>
        <StyledDescription value="When to create this task" />
        <Radio.Group onChange={e => setStartMode(e.target.value)} value={startMode}
          // optionType="button"
          buttonStyle="solid"
        >
          <Space direction="vertical">
            <Radio value={'now'}>Create now</Radio>
            <Radio value={'later'}>
              <Space>
                Scheduled in future date
                <DatePicker disabledDate={disabledPastDate} format="D MMM YYYY" disabled={startMode !== 'later'} />
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </>,
    },
    {
      title: 'Recurring',
      content: <>
        <StyledDescription value="Choose a task template to begin with." />
        <Radio.Group onChange={e => setRecurringMode(e.target.value)} value={recurringMode}
          // optionType="button"
          buttonStyle="solid"
        >
          <Space direction="vertical">
            <Radio value={'once'}>One-time task</Radio>
            <Radio value={'recurring'}>
              <Space>
                Recurring every
                <RecurringPeriodInput style={{ width: 180 }} disabled={recurringMode!=='recurring'}/>
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </>,
    },
    {
      title: 'Task name',
      content: <>
        <StyledDescription value="Task name" />
        <Input style={{ height: 50 }}
          placeholder={taskName}
          onPressEnter={handleNameEnter}
          autoFocus
          allowClear
          // value={taskName}
          onChange={e => setTaskName(e.target.value)} />
      </>,
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const currentStepDef = steps[current];
  const canNext = currentStepDef.canNext?.();
  return (
    <Loading loading={loading}>

      {/* <Steps current={current} items={items} size="small" progressDot /> */}
      <Progress percent={100 * (current + 1) / steps.length} showInfo={false} size="small" />
      <Space direction="vertical" style={{ width: '100%' }}>{currentStepDef.content}</Space>

      <Row justify={current ? "space-between" : 'end'} style={{ marginTop: 20 }}>
        {current > 0 && (
          <Button icon={<LeftOutlined />} type="primary" ghost onClick={() => prev()}>
            Previous
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" ghost onClick={() => next()} disabled={!canNext}>
            Next <RightOutlined />
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary"
            disabled={!clientInfo}
            onClick={handleCreateAndEdit}
          >Create Task</Button>
        )}

      </Row>
    </Loading>
  );
});


TaskGenerator.propTypes = {
  taskTemplateId: PropTypes.string,
  client: PropTypes.object,
  onCancel: PropTypes.func,
  onCreated: PropTypes.func,
  postCreateMode: PropTypes.oneOf(['notify', 'navigate']).isRequired
};

TaskGenerator.defaultProps = {
  onCancel: () => { },
  onCreated: () => { },
  postCreateMode: 'notify',
};