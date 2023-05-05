
import React from 'react';
import { Space, Typography, Button, Form, Card, Col, Row, Input, InputNumber, Select } from 'antd';
import { Loading } from 'components/Loading';
import PropTypes from 'prop-types';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import { getTaskTemplate$ } from 'services/taskTemplateService';
import { catchError, finalize, mapTo, tap, window } from 'rxjs/operators';
import { ClockCircleFilled, ClockCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { createNewTask$ } from 'services/taskService';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import Icon from '@ant-design/icons';
import { MdDashboard, MdOpenInNew } from 'react-icons/md';
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
import { saveRecurring$ } from 'services/recurringService';
import styled from 'styled-components';

const { Text, Link: TextLink, Paragraph, Title } = Typography;

const Container = styled.div`
padding-top: 20px;

h5 {
  margin-top: 8px;
}
`


export const TaskOrRecurringGenerator = React.memo(props => {
  const { value, postCreateMode, onCreated, onTaskCreated, onRecurringCreated } = props;
  const [mode, setMode] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const formRef = React.useRef();

  const entityId = uuidv4();

  const disabledPastDate = (current) => {
    // Can not select days before today and today
    return current && current.endOf('day').isBefore();
  };

  const handlePostCreateAction = (entity) => {
    const isTask = mode === 'task';
    debugger;
    if (postCreateMode === 'navigate') {
      if (isTask) {
        navigate(`/task/${entity.id}`)
      } else {
        navigate(`/recurring`)
      }
    } else {
      // notify
      const notice = notify.success(
        `Successfully created ${isTask ? 'task' : 'recurring'}`,
        <Text>{isTask ? 'Task' : 'Recurring'} <TextLink strong onClick={() => {
          notice.close();
          navigate(`/${isTask ? 'task' : 'recurring'}/${entity.id}`);
        }}>{entity.name}</TextLink> was created</Text>,
      );
    }
  }

  const handleSubmit = (values) => {
    const { orgClientId: orgClient, formTemplateId: formTemplate, name, firstRunOn, repeating } = values;

    const orgClientId = orgClient?.id;
    const formTemplateId = formTemplate?.id;
    let source$;
    let entity;
    if (mode === 'task') {
      entity = {
        id: entityId,
        orgClientId,
        formTemplateId,
        name,
      }
      source$ = createNewTask$(entity);
    } else if (mode === 'recurring') {
      entity = {
        id: entityId,
        name,
        orgClientId,
        formTemplateId,
        firstRunOn: firstRunOn?.toDate(),
        every: repeating?.[0],
        period: repeating?.[1],
      }
      source$ = saveRecurring$(entity);
    }

    setLoading(true)
    source$.pipe(
      finalize(() => setLoading(false)),
    ).subscribe(() => {
      handlePostCreateAction(entity);
      onCreated(entity);
      if (mode === 'task') {
        onTaskCreated(entity);
      } else if (mode === 'recurring') {
        onRecurringCreated(entity);
      }
    })
  }

  const handleCreate = () => {
    formRef.current.submit();
  }

  return (
    <Loading loading={loading}>
      <Container>
      {!mode && <Space direction='vertical' style={{ width: '100%', margin: '20px auto' }} size="large">
        {/* <Paragraph>Choose task type. </Paragraph> */}
        <Card
          hoverable
          onClick={() => setMode('task')}
        >
          <Title level={5}><Icon component={MdDashboard} /> Task</Title>
          <Paragraph type="secondary">The task will be created right away and you can see it from task board and task list immediately.</Paragraph>
        </Card>
        <Card
          hoverable
          onClick={() => setMode('recurring')}
        >
          <Title level={5}><ClockCircleOutlined /> Recurring</Title>
          <Paragraph type="secondary">The task will be created upon the specified recurring pattern.</Paragraph>
        </Card>
      </Space>
      }
      {mode && <><Form
        layout='vertical'
        ref={formRef}
        initialValues={value}
        onFinish={handleSubmit}
      >
        <Form.Item name="name" label="Name"
          rules={[{ required: true }]}
        >
          <Input placeholder='Name' autoFocus allowClear />
        </Form.Item>
        <Form.Item name="orgClientId" label="Client"
          rules={[{ required: true }]}
          valuePropName="id"
        >
          <OrgClientSelect style={{ width: '100%' }}
            onLoadingChange={setLoading}
          />
        </Form.Item>
        <Form.Item name="formTemplateId" label="Task template"
          rules={[{ required: mode === 'recurring' }]}
          valuePropName="id"
        >
          <TaskTemplateSelect style={{ width: '100%' }}
            showIcon={true} />
        </Form.Item>
        {mode === 'recurring' && <>
          <Form.Item name="firstRunOn"
            label="Start On (First Run)"
            rules={[{ required: true }]}
            extra="If you select either 29, 30, or 31, the system will determine the nearest date in the upcoming month or year. For instance, if the starting date is January 31 and the recurrence is monthly, the subsequent occurrence will be on February 28."
          >
            <DatePicker disabledDate={disabledPastDate} format="D MMM YYYY" />
          </Form.Item>
          <Form.Item name="repeating" label="Recurring"
            rules={[{ required: true }]}
          >
            <RecurringPeriodInput style={{ width: 180 }} />
          </Form.Item>
        </>}
      </Form>
        <Row justify="end">
          <Button type="primary" onClick={handleCreate}>Create</Button>
        </Row>
      </>}
      </Container>
    </Loading>
  );
});


TaskOrRecurringGenerator.propTypes = {
  value: PropTypes.object,
  onCancel: PropTypes.func,
  postCreateMode: PropTypes.oneOf(['notify', 'navigate']).isRequired,
  onCreated: PropTypes.func,
  onTaskCreated: PropTypes.func,
  onRecurringCreated: PropTypes.func,
};

TaskOrRecurringGenerator.defaultProps = {
  onCancel: () => { },
  onCreated: () => { },
  postCreateMode: 'notify',
  onTaskCreated: () => { },
  onRecurringCreated: () => { },
};