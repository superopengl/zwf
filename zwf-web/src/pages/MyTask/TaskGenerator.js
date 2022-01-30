
import React from 'react';
import styled from 'styled-components';
import { Radio, Space, Typography, Button } from 'antd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { listTaskTemplate } from 'services/taskTemplateService';
import { listPortfolio } from 'services/portfolioService';
import StepWizard from 'react-step-wizard';
import { Loading } from 'components/Loading';
import PropTypes from 'prop-types';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import ClientSelect from 'components/ClientSelect';

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
  const wizardRef = React.useRef(null);

  const handleTaskTypeChange = taskTemplateIdValue => {
    // wizardRef.current.nextStep();
    setTaskTemplateId(taskTemplateIdValue);
  }

  const handleClientChange = clientEmailValue => {
    setClientEmail(clientEmailValue);
    const data = {
      taskTemplateId,
      clientEmail
    };
    props.onChange(data);
  }

  return (
    <Container>
      {/* <Steps progressDot current={currentStep}>
        <Steps.Step title="Choose task type" />
        <Steps.Step title="Choose portfolio" />
      </Steps> */}
      <>
        {!taskTemplateId && <div>
          <Space size="middle" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Choose a task template to begin with.</Text>
            <TaskTemplateSelect style={{ width: '100%' }} onChange={handleTaskTypeChange} />
          </Space>
        </div>}
        {taskTemplateId && <div>
          <Space size="middle" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Choose existing client or input client's email address.</Text>
            <ClientSelect style={{ width: '100%' }} onChange={handleClientChange} />
          </Space>
        </div>}
        {taskTemplateId && clientEmail && <div>
          <Space size="middle" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Choose existing client or input client's email address.</Text>
            <ClientSelect style={{ width: '100%' }} onChange={handleClientChange} />
          </Space>
        </div>}
      </>
    </Container>
  );
};


TaskGenerator.propTypes = {
  taskTemplateId: PropTypes.string,
  onChange: PropTypes.func
};

TaskGenerator.defaultProps = {
  onChange: () => { }
};