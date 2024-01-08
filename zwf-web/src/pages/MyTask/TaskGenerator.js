
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
  const [taskTemplateId, setTaskTemplateId] = React.useState();
  const wizardRef = React.useRef(null);

  const handleTaskTypeChange = taskTemplateId => {
    wizardRef.current.nextStep();
    setTaskTemplateId(taskTemplateId);
  }

  const handlePortfolioChange = clientId => {
    const data = {
      taskTemplateId,
      clientId
    };
    props.onChange(data);
  }

  return (
    <Container>
      {/* <Steps progressDot current={currentStep}>
        <Steps.Step title="Choose task type" />
        <Steps.Step title="Choose portfolio" />
      </Steps> */}
      <StepWizard ref={wizardRef}>
        <div>
          <Space size="middle" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Choose task type</Text>
            <TaskTemplateSelect style={{ width: '100%' }} onChange={handleTaskTypeChange} />
          </Space>
        </div>
        <div>
          <Space size="middle" direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">Choose portfolio to fill the task automatically</Text>
            <ClientSelect style={{ width: '100%' }} onChange={handlePortfolioChange} />
          </Space>
        </div>
      </StepWizard>
    </Container>
  );
};


TaskGenerator.propTypes = {
  onChange: PropTypes.func
};

TaskGenerator.defaultProps = {
  onChange: () => { }
};