import React from 'react';
import { generateTask, saveTask } from 'services/taskService';
import { TaskGenerator } from './TaskGenerator';
import StepWizard from 'react-step-wizard';
import TaskFieldsEditor from './TaskFieldsEditor';
import GenDocFieldStep from './GenDocFieldStep';
import { Spin, Progress, Space, Typography } from 'antd';
import GenDocLinkStep from './GenDocLinkStep';
import UploadDocStep from './UploadDocStep';
import FinalReviewStep from './FinalReviewStep';
import { withRouter } from 'react-router-dom';
import { getPortfolio } from 'services/portfolioService';
import TaskNameStep from './TaskNameStep';
import { Loading } from 'components/Loading';

const { Text } = Typography;

export const TaskFormWizard = props => {
  const { value, portfolioId } = props;

  const [loading, setLoading] = React.useState(false);
  const [task, setTask] = React.useState(value);
  const [variableContextDic, setVariableContextDic] = React.useState({});
  const [progess, setProgress] = React.useState({ current: 0, total: 0 });
  const wizardRef = React.useRef(null);
  const generatorRef = React.useRef(null);

  React.useEffect(() => {
    setProgress({
      current: wizardRef?.current?.currentStep || 0,
      total: wizardRef?.current?.totalSteps || 0
    })
  }, [wizardRef?.current?.currentStep, wizardRef?.current?.totalSteps])

  const handleStepChange = (info) => {
    setProgress({
      current: info.activeStep || 0,
      total: wizardRef.current.totalSteps
    });
  }

  const handleGenerateTask = async (values) => {
    setLoading(true);
    const { taskTemplateId, portfolioId: clientId } = values;
    const task = await generateTask(taskTemplateId, clientId);
    const portfolio = await getPortfolio(clientId);

    setTask(task);
    setVariableContextDic(portfolio.fields.reduce((pre, cur) => {
      pre[cur.name] = cur.value
      return pre;
    }, {}));
    setLoading(false);
  }

  const handleTaskFieldsChange = task => {
    const variables = task.fields.reduce((pre, cur) => {
      pre[cur.name] = cur.value;
      return pre;
    }, {});
    setTask(task);
    setVariableContextDic({
      ...variableContextDic,
      ...variables
    });
    wizardRef.current.nextStep();
  }

  const handleStepBack = () => {
    wizardRef.current.previousStep();
  }

  const handleSkip = () => {
    handleNext();
  }

  const handleNext = () => {
    wizardRef.current.nextStep();
  }

  const handleGenDocFieldChange = values => {
    setVariableContextDic({
      ...variableContextDic,
      ...values,
    });
    handleNext();
  }

  const handleGenDocViewConfirmed = doc => {
    task.docs = task.docs.map(d => d.docTemplateId === doc.docTemplateId ? doc : d);
    setTask({ ...task });
    handleNext();
  }

  const handleUploadDocsChange = docs => {
    task.docs = docs;
    setTask({ ...task });
    handleNext();
  }

  const goToTaskList = () => {
    props.history.push(`/tasks`);
  }

  const handlePostSubmit = async () => {
    setLoading(true);
    try {
      await saveTask({ ...task, status: 'todo' });
      // form.resetFields();
      setLoading(false);
      goToTaskList();
    } catch {
      setLoading(false);
    }
  }

  const handleUpdateTaskName = name => {
    task.name = name;
    setTask({ ...task });
    handleNext();
  }

  const getGenDocSteps = () => {
    const steps = [];
    const genDocs = task?.docs.filter(d => d.docTemplateId) || [];
    genDocs.forEach((doc, i) => {
      if (doc.variables?.length) {
        steps.push(<GenDocFieldStep key={`field_${i}`}
          doc={doc}
          variableDic={variableContextDic}
          onSkip={handleSkip}
          onBack={handleStepBack}
          onFinish={handleGenDocFieldChange}
        />);
      }
      steps.push(<GenDocLinkStep key={`doc_${i}`}
        doc={doc}
        variableDic={variableContextDic}
        onSkip={handleSkip}
        onBack={handleStepBack}
        onFinish={handleGenDocViewConfirmed}
        skipLoading={true}
      />);
    });
    return steps;
  }

  console.log('wizard var dic', variableContextDic);


  return <Loading loading={loading}>
    <StepWizard ref={generatorRef}>
      {!task && <TaskGenerator onChange={handleGenerateTask} />}
      {task && <><Space size="large" direction="vertical" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', fontSize: '2rem' }}>
          <Text type="secondary">{progess.current} / {progess.total}</Text>
          <Progress strokeColor="#183e91" strokeLinecap="square" type="line" percent={progess.total ? 100 * progess.current / progess.total : 0} showInfo={false} />
        </div>
        <StepWizard ref={wizardRef} onStepChange={handleStepChange}>
          <TaskNameStep
            task={task}
            onFinish={handleUpdateTaskName}
          />
          {task.fields.filter(field => !field.officialOnly).length > 0 && <TaskFieldsEditor task={task}
            onSkip={handleSkip}
            onBack={handleStepBack}
            onFinish={handleTaskFieldsChange} />}
          {getGenDocSteps()}
          <UploadDocStep
            task={task}
            onSkip={handleSkip}
            onBack={handleStepBack}
            onFinish={handleUploadDocsChange}
          />
          <FinalReviewStep
            task={task}
            onBack={handleStepBack}
            onFinish={handlePostSubmit}
          />
        </StepWizard>
      </Space></>}
    </StepWizard>
    {/* <pre>{JSON.stringify(task, null, 2)}</pre> */}
  </Loading>
}