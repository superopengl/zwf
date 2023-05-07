
import React from 'react';
import { Space, Typography, Button, Form, Radio, Progress, Row, Input, InputNumber, Select } from 'antd';
import { Loading } from 'components/Loading';
import PropTypes from 'prop-types';
import {FemplateSelect} from 'components/FemplateSelect';
import { getFemplate$ } from 'services/femplateService';
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
import dayjs from 'dayjs';
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
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { RiNumbersFill } from 'react-icons/ri';

const { Text, Link: TextLink, Paragraph } = Typography;

const StyledDescription = props => <Paragraph type="secondary">{props.value}</Paragraph>

export const TaskGenerator = React.memo(props => {
  const { client, postCreateMode } = props;
  const [femplateId, setFemplateId] = React.useState(props.femplateId);
  const [clientInfo, setClientInfo] = React.useState(client);
  const [startMode, setStartMode] = React.useState();
  const [recurringMode, setRecurringMode] = React.useState();
  const [startAt, setStartAt] = React.useState();
  const [taskName, setTaskName] = React.useState();
  const [femplate, setFemplate] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [current, setCurrent] = React.useState(0);
  const [newTaskInfo, setNewTaskInfo] = React.useState({});
  const navigate = useNavigate();
  const formRef = React.useRef();

  React.useEffect(() => {
    if (femplateId) {
      getFemplate$(femplateId)
        .pipe(
          catchError(() => setLoading(false))
        )
        .subscribe(femplate => {
          setFemplate(femplate)
          setLoading(false)
        });
    } else {
      setFemplate(null)
    }
  }, [femplateId])

  React.useEffect(() => {
    if (clientInfo && femplate) {
      const name = `${femplate.name} - ${clientInfo.clientAlias}`;
      setTaskName(name);
    }
  }, [clientInfo, femplate])

  const handleFemplateChange = formTemplateid => {
    setNewTaskInfo({ ...newTaskInfo, formTemplateid })
    next();
  }

  const handleClientChange = (client) => {
    setNewTaskInfo({ ...newTaskInfo, orgClientId: client.id })
    next();
  }

  const handleNameEnter = (e) => {
    handleCreateAndEdit();
  }

  const disabledPastDate = (current) => {
    // Can not select days before today and today
    return current && current.endOf('day').isBefore();
  };

  const sourceCreateTask$ = () => {
    setLoading(true);
    return createNewTask$(newTaskInfo).pipe(
      finalize(() => setLoading(false)),
    )
  }

  const handleCreateAndEdit = () => {
    const isValid = newTaskInfo.orgClientId && newTaskInfo.taskName;
    if (!isValid) return;
    sourceCreateTask$().subscribe(task => {
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

  const handleStartModeChange = e => {
    const newMode = e.target.value;
    setStartMode(newMode);
    if (newMode === 'now') {
      setNewTaskInfo({ ...newTaskInfo, startAt: null })
      next();
    } else {
    }
  }

  const handleStartAtChange = value => {
    setNewTaskInfo({ ...newTaskInfo, startAt: value?.toDate() })
  }

  const handleRecurringModeChange = e => {
    const recurringMode = e.target.value;
    setRecurringMode(recurringMode);
    if (recurringMode === 'once') {
      setNewTaskInfo({ ...newTaskInfo, every: null, period: null })
      next();
    }
  }

  const handleRecurringPeriodChange = values => {
    const every = values?.[0];
    const period = values?.[1];
    setNewTaskInfo({ ...newTaskInfo, every, period })
  }

  const handleTaskNameChange = e => {
    const taskName = e.target.value?.trim();
    setNewTaskInfo({ ...newTaskInfo, taskName })
  }

  const isRecurring = newTaskInfo.startAt || newTaskInfo.every || newTaskInfo.period;

  const steps = [
    {
      title: 'Client',
      description: 'Choose a client.',
      content: <>
        <OrgClientSelect style={{ width: '100%' }}
          onChange={handleClientChange}
          onLoadingChange={setLoading}
          value={newTaskInfo.orgClientId} />
      </>,
      canNext: () => newTaskInfo.orgClientId,
    },
    {
      title: 'Start',
      description: 'Shall the task be created right now or in a later time as an recurring.',
      content: <>
        <Radio.Group onChange={handleStartModeChange} value={startMode}
          // optionType="button"
          buttonStyle="solid"
        >
          <Space direction="vertical">
            <Radio value={'now'}>Create now</Radio>
            <Radio value={'later'}>
              <Space>
                Scheduled in future time
                <DatePicker disabledDate={disabledPastDate} format="D MMM YYYY" disabled={startMode !== 'later'}
                  value={newTaskInfo.startAt ? dayjs(newTaskInfo.startAt) : null}
                  onChange={handleStartAtChange}
                />
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </>,
      canNext: () => {
        return newTaskInfo.orgClientId && (startMode === 'now' || (startMode === 'later' && dayjs(newTaskInfo.startAt).isAfter()))
      },
    },
    {
      title: 'Recurring',
      description: 'How often the task will be recuringly created.',
      content: <>
        <Radio.Group onChange={handleRecurringModeChange} value={recurringMode}
          // optionType="button"
          buttonStyle="solid"
        >
          <Space direction="vertical">
            <Radio value={'once'}>One-time task</Radio>
            <Radio value={'recurring'}>
              <Space>
                Recurring every
                <RecurringPeriodInput style={{ width: 180 }}
                  disabled={recurringMode !== 'recurring'}
                  value={[newTaskInfo.every, newTaskInfo.period]}
                  onChange={handleRecurringPeriodChange} />
              </Space>
            </Radio>
          </Space>
        </Radio.Group>
      </>,
      canNext: () => {
        return newTaskInfo.orgClientId && (recurringMode === 'once' || (recurringMode === 'recurring' && newTaskInfo.period && newTaskInfo.every))
      },
    },
    {
      title: 'From template',
      description: isRecurring ? 'Choose a template for the recurring' : 'Optionally choose a template to begin with',
      content: <>
        <FemplateSelect style={{ width: '100%' }} onChange={handleFemplateChange}
          showIcon={true} value={newTaskInfo.formTemplateid} />
      </>,
      canNext: () => newTaskInfo.orgClientId && (!isRecurring || newTaskInfo.formTemplateid)
    },
    {
      title: 'Task name',
      description: isRecurring ? 'Name of new recurring' : 'Name of new task',
      content: <>
        <Input 
          placeholder={taskName}
          onPressEnter={handleNameEnter}
          autoFocus
          allowClear
          // value={taskName}
          onChange={handleTaskNameChange} />
      </>,
    },
  ];

  const next = () => {
    setCurrent(pre => pre + 1);
  };

  const prev = () => {
    setCurrent(pre => pre - 1);
  };

  const currentStepDef = steps[current];
  const canNext = currentStepDef.canNext?.();

  return (
    <Loading loading={loading}>
      {/* <Steps current={current} items={items} size="small" progressDot /> */}
        <Progress percent={100 * (current + 1) / steps.length} showInfo={false} size="small" status="active"/>
      <Space direction="vertical" style={{ width: '100%', margin: '30px 0' }} align='middle' size="default">
        <Paragraph>{currentStepDef.description}</Paragraph>
        {currentStepDef.content}
      </Space>

      <Row justify={current ? "space-between" : 'end'} style={{ marginTop: 20 }}>
        {current > 0 && (
          <Button icon={<LeftOutlined />} type="primary" ghost onClick={prev}>
            Previous
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" ghost onClick={next} disabled={!canNext}>
            Next <RightOutlined />
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary"
            disabled={!(newTaskInfo.orgClientId && newTaskInfo.taskName)}
            onClick={handleCreateAndEdit}
          >Create Task</Button>
        )}

      </Row>
    </Loading>
  );
});


TaskGenerator.propTypes = {
  femplateId: PropTypes.string,
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