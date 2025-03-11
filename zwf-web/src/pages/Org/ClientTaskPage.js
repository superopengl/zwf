import React from 'react';

import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Steps, Space, Typography, Row, Col, Badge, Skeleton, Button, Grid, Tooltip, Drawer, Alert, Modal } from 'antd';

import { getTask$, listTaskComment$ } from 'services/taskService';
import { Loading } from 'components/Loading';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { TaskCommentInputForm } from 'components/TaskCommentInputForm';
import { TaskCommentPanel } from 'components/TaskCommentPanel';
import { combineLatest } from 'rxjs';
import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { finalize } from 'rxjs/operators';
import { TaskIcon } from 'components/entityIcon';
import { CommentOutlined, ExclamationCircleFilled, LeftOutlined, MessageOutlined, RightOutlined, SyncOutlined } from '@ant-design/icons';
import { SavingAffix } from 'components/SavingAffix';
import { useAssertRole } from 'hooks/useAssertRole';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import ClientTaskListPage from 'pages/ClientTask/ClientTaskListPage';
import { ClientTaskDocListPanel } from 'components/ClientTaskDocListPanel';
import { TaskLogAndCommentDrawer } from 'components/TaskLogAndCommentDrawer';
import { ZeventNoticeableBadge } from 'components/ZeventNoticeableBadge';
import { TaskDocToSignPanel } from 'components/TaskDocToSignPanel';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { ProCard } from '@ant-design/pro-components';
import { DefaultFooter } from '@ant-design/pro-components';
import { getPendingSignTaskDocs } from 'util/getPendingSignTaskDocs';
import { ClientTaskCommentDrawer } from 'components/ClientTaskCommentDrawer';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // background-color: yellow;
  height: 100%;
  width: 100%;
  // max-width: 1200px;
`;

const PageFooter = styled.div`
position: fixed;
bottom: 0;
left: 0;
right: 0;
width: 100vw;
padding: 16px;
background-color: white;
`;


const FLOW_STEPS = {
  FILL_IN_FORM: 0,
  ATTACHMENTS: 1,
  SIGN_DOCS: 2,
}

const ALERT_DEF = {
  'in_progress': {
    type: 'info',
    message: 'In progress',
    description: `The task is currently in progress. There is no need for you to take any action until ZeeWorkflow provides further notification.`
  },
  'action_required': {
    type: 'error',
    message: 'Action required.',
    icon: <ExclamationCircleFilled />,
    description: <>
      To proceed this task, you are required to take certain actions such as
      <ul>
        <li>signing documents, </li>
        <li>uploading additional supporting documents, </li>
        <li>modifying the information provided in the form.</li>
      </ul>
      Please review any comments left by your agent as instructions.
    </>,
  },
  'done': {
    type: 'success',
    message: 'Completed',
    description: 'The task has been successfully completed.'
  },
}

const ClientTaskPage = (props) => {
  useAssertRole(['client']);
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = React.useState(true);
  const [signPanelOpen, setSignPanelOpen] = React.useState(false);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);
  const [currentStep, setCurrentStep] = React.useState(FLOW_STEPS.FILL_IN_FORM);
  const [commentOpen, setCommentOpen] = React.useState(false);
  const [docsToSign, setDocsToSign] = React.useState([]);
  const [requestChangeModal, requestChangeContextHolder] = Modal.useModal();
  const navigate = useNavigate();

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe();
  }, [id])

  React.useEffect(() => {
    setDocsToSign(getPendingSignTaskDocs(task));
  }, [task])

  React.useEffect(() => {
    if (docsToSign.length > 0) {
      setCurrentStep(FLOW_STEPS.SIGN_DOCS);
    }
  }, [docsToSign])

  const load$ = () => {
    setLoading(true);
    const sub$ = getTask$(id).pipe(
      finalize(() => setLoading(false))
    ).subscribe(task => {
      setTask(task);
    })

    return sub$;
  }

  const handleDocChange = () => {
    load$();
  }

  const handleGoBack = () => {
    navigate('/task');
  }

  const isFormView = currentStep === 0;
  const isDocView = currentStep === 1;
  const screens = useBreakpoint();

  const span = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12, xxl: 12 };
  const canRequestChange = false && (task?.status === 'todo' || task?.status === 'in_progress');
  const canEdit = task?.status === 'action_required' || task?.status === 'in_progress';
  const narrowScreen = (screens.xs || screens.sm) && !screens.md;

  const getInitialStep = (task) => {
    if (canEdit) {
      return FLOW_STEPS.FILL_IN_FORM;
    }
  }

  const hasDocToSign = docsToSign.length > 0;
  const lastStep = hasDocToSign ? FLOW_STEPS.SIGN_DOCS : FLOW_STEPS.ATTACHMENTS;
  const alertMeta = ALERT_DEF[task?.status];

  const handleRequestChange = () => {
    requestChangeModal.confirm({
      title: 'Request Amendment',
      content: 'The task is being processed by agent. Do you want to amend by providing updated information?',
      closable: true,
      cancelButtonProps: {
        type: 'text'
      },
      autoFocusButton: 'cancel',
      okText: 'Request Amendment'
    })
  }

  return (<Container>
    {!task ? <Skeleton active /> : <PageHeaderContainer
      loading={loading}
      onBack={handleGoBack}
      fixedHeader={true}
      maxWidth={1000}
      icon={<TaskIcon />}
      title={<>{task.name} <small><Text type="secondary">by {task.orgName}</Text></small></> || <Skeleton paragraph={false} />}
      // footer={<Button type="primary">Submit</Button>}
      extra={[
        <ZeventNoticeableBadge key="refresh"
          message="This task has changes. Click to refresh"
          filter={z => z.type === 'task.change' && z.taskId === task.id}
        >
          <Button icon={<SyncOutlined />} onClick={() => load$()} />
        </ZeventNoticeableBadge>,
        <ZeventNoticeableBadge key="comment"
          message="This task has unread comment"
          filter={z => z.type === 'task.comment' && z.taskId === task.id}
        >
          <Button icon={<MessageOutlined />} onClick={() => setCommentOpen(true)}>Comment</Button>
        </ZeventNoticeableBadge>,
        canRequestChange ? <Button key="request">Request change</Button> : null,
      ]}
    >
      {/* <DebugJsonPanel value={screens} /> */}
      <Alert
        type={alertMeta.type}
        icon={alertMeta.icon}
        message={alertMeta.message}
        description={alertMeta.description}
        showIcon
        style={{ marginBottom: 30 }} />

      <Row gutter={[40, 40]}>
        <Col>
          <Steps
            direction={narrowScreen ? 'horizontal' : 'vertical'}
            progressDot={true}
            current={currentStep}
            onChange={setCurrentStep}
            size="small"
            items={[
              {
                title: 'Fill in the form',
              },
              {
                title: 'Attachments',
              },
              hasDocToSign ? {
                title: <>Sign documents <Badge count={docsToSign.length} showZero={false} /></>
              } : null,
            ]}
          />
        </Col>
        <Col flex="auto">
          {currentStep === FLOW_STEPS.FILL_IN_FORM && <ProCard title="Information Form" type="inner">
            <AutoSaveTaskFormPanel value={task} mode="client" onSavingChange={setSaving} />
          </ProCard>}
          {currentStep === FLOW_STEPS.ATTACHMENTS && <ClientTaskDocListPanel task={task} onSavingChange={setSaving} onChange={handleDocChange} disabled={!canEdit} />}
          {currentStep === FLOW_STEPS.SIGN_DOCS && <ProCard
            title={`${docsToSign.length} Document Waiting for Your Signature`}
            bodyStyle={{ paddingLeft: 16, paddingRight: 16 }}
            type="inner"
          >
            <TaskDocToSignPanel docs={task?.docs} onSavingChange={setSaving} onChange={handleDocChange} />
          </ProCard>}
        </Col>
      </Row>
      <Row gutter={[20, 20]} justify="space-between" style={{marginTop: 30}}>
        <Col>
        </Col>
        <Col>
          <Space style={{ justifyContent: 'end' }} size="large">
            {currentStep !== 0 && <Button type="primary" ghost onClick={() => setCurrentStep(pre => pre - 1)}><LeftOutlined /> Previous</Button>}
            {currentStep !== lastStep && <Button type="primary" ghost onClick={() => setCurrentStep(pre => pre + 1)}>Next <RightOutlined /></Button>}
            {currentStep === lastStep && <Button type="primary" onClick={() => navigate('/task')}>Done</Button>}
          </Space>
        </Col>
      </Row>
      {saving && <SavingAffix />}
    </PageHeaderContainer>}
    {task && <ClientTaskCommentDrawer taskId={task.id} open={commentOpen} onClose={() => setCommentOpen(false)} />}
    {/* <PageFooter>
      <Row gutter={[20, 20]} justify="space-between">
        <Col>
        </Col>
        <Col>
          <Space style={{ justifyContent: 'end' }} size="large">
            {currentStep !== 0 && <Button type="primary" ghost onClick={() => setCurrentStep(pre => pre - 1)}><LeftOutlined /> Previous</Button>}
            {currentStep !== lastStep && <Button type="primary" ghost onClick={() => setCurrentStep(pre => pre + 1)}>Next <RightOutlined /></Button>}
            {currentStep === lastStep && <Button type="primary" onClick={() => navigate('/task')}>Done</Button>}
          </Space>
        </Col>
      </Row>
    </PageFooter> */}
    {requestChangeContextHolder}
  </Container>
  );
};

ClientTaskPage.propTypes = {
  // id: PropTypes.string.isRequired
};

ClientTaskPage.defaultProps = {
  // taskId: 'new'
};

export default ClientTaskPage;
