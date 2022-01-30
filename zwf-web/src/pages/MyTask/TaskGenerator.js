
import React from 'react';
import styled from 'styled-components';
import { Radio, Space, Typography, Button, Steps, Form, Divider, Row, Col } from 'antd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { listTaskTemplate } from 'services/taskTemplateService';
import { listPortfolio } from 'services/portfolioService';
import StepWizard from 'react-step-wizard';
import { Loading } from 'components/Loading';
import PropTypes from 'prop-types';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import ClientSelect from 'components/ClientSelect';
import { convertTaskTemplateFieldsToFormFieldsSchema } from '../../util/convertTaskTemplateFieldsToFormFieldsSchema';
import { getTaskTemplate$ } from 'services/taskTemplateService';
import FormBuilder from 'antd-form-builder'
import { catchError } from 'rxjs/operators';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Container = styled.div`
.ant-radio-button-wrapper:not(:first-child)::before {
  display: none;
}

.ant-radio-button-wrapper {
  border-width: 1px;
  display: block;
  margin-bottom: 1rem;
  border-radius: 6px;

  &.portfolio {
    height: 60px;
    padding-top: 10px;
  }
}
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

export const TaskGenerator = props => {
  const [taskTemplateId, setTaskTemplateId] = React.useState(props.taskTemplateId);
  const [clientEmail, setClientEmail] = React.useState(null);
  const [current, setCurrent] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [clientFieldSchema, setClientFieldSchema] = React.useState([]);
  const [agentFieldSchema, setAgentFieldSchema] = React.useState([]);
  const formRef = React.createRef();

  const handleTaskTemplateChange = taskTemplateIdValue => {
    // wizardRef.current.nextStep();
    setTaskTemplateId(taskTemplateIdValue);

    getTaskTemplate$(taskTemplateIdValue)
      .pipe(
        catchError(() => setLoading(false))
      )
      .subscribe(taskTemplate => {
        const clientFields = convertTaskTemplateFieldsToFormFieldsSchema(taskTemplate.fields, false);
        clientFields.fields.forEach(f => {
          f.required = false;
        });
        setClientFieldSchema(clientFields);
        const agentFields = convertTaskTemplateFieldsToFormFieldsSchema(taskTemplate.fields, true);
        setAgentFieldSchema(agentFields);
        setCurrent(x => x + 1)
        setLoading(false);
      })
  }

  const handleClientChange = clientEmailValue => {
    setClientEmail(clientEmailValue);
    if (clientEmailValue) {
      setCurrent(x => x + 1);
    }
  }

  const handleStepChange = step => {
    setCurrent(step);
  }

  const steps = [
    {
      title: 'Client',
      content: <Space size="middle" direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary">Choose existing client or input client's email address.</Text>
        <ClientSelect style={{ width: '100%' }} onChange={handleClientChange} value={clientEmail} />
      </Space>
    },
    {
      title: 'Task template',
      disabled: !clientEmail,
      content: <Space size="middle" direction="vertical" style={{ width: '100%' }}>
        <Text type="secondary">Choose a task template to begin with.</Text>
        <TaskTemplateSelect style={{ width: '100%' }} onChange={handleTaskTemplateChange} value={taskTemplateId} />
      </Space>
    },
    {
      title: 'Fields',
      disabled: !clientEmail || !taskTemplateId || !clientFieldSchema,
      content: <Form
        ref={formRef}
        // onFinish={handleFormFinish}
        layout="vertical"
        colon={false}
      // initialValues={{ name: taskTemplate.name }}
      >
        <FormBuilder meta={clientFieldSchema} form={formRef} />
        {agentFieldSchema.length > 0 && <>
          <Title level={5} type="secondary" style={{ marginTop: 40 }}>Official only fields</Title>
          <Divider style={{ marginTop: 4 }} />
          <FormBuilder meta={agentFieldSchema} form={formRef} />
        </>}
      </Form>
    }
  ]

  return (
    <Space direction='vertical' style={{ width: '100%' }} size="large">
      <Steps
        type="navigation"
        size="small"
        current={current}
        onChange={handleStepChange}
      >
        {/* <Steps progressDot current={currentStep}>
        <Steps.Step title="Choose task type" />
        <Steps.Step title="Choose portfolio" />
      </Steps> */}
        <>

          {steps.map(item => (
            <Steps.Step key={item.title} title={item.title} disabled={item.disabled} />
          ))}
        </>
      </Steps>
      <div>
        {steps[current].content}
      </div>
      <Divider />
      {/* <Button block icon={<LeftOutlined />} disabled={current === 0} onClick={() => setCurrent(x => x - 1)}></Button> */}
      {/* <Button block icon={<RightOutlined />} disable={current === steps.length - 1} onClick={() => setCurrent(x => x + 1)}></Button> */}
      <Row justify='space-between'>
        <Button ghost type="text"><Text type="danger">Cancel</Text></Button>
        <Space>
          {current === steps.length - 1 && <Button type="primary" ghost disabled={current !== steps.length - 1}>Create Task & Another</Button>}
          {current === steps.length - 1 && <Button type="primary" disabled={current !== steps.length - 1}>Create Task</Button>}
        </Space>
      </Row>
    </Space>
  );
};


TaskGenerator.propTypes = {
  taskTemplateId: PropTypes.string,
  onChange: PropTypes.func
};

TaskGenerator.defaultProps = {
  onChange: () => { }
};