import React from 'react';

import styled from 'styled-components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Steps, Space, Typography, Row, Col, Badge, Skeleton, Button, Grid, Tooltip, Drawer, Alert, Modal } from 'antd';

import { getTask$, listTaskComment$ } from 'services/taskService';
import { Loading } from 'components/Loading';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { TaskCommentInputForm } from 'components/TaskCommentInputForm';
import { TaskCommentPanel } from 'components/TaskCommentPanel';
import { combineLatest, of } from 'rxjs';
import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { finalize } from 'rxjs/operators';
import { TaskIcon } from 'components/entityIcon';
import Icon, { CommentOutlined, ExclamationCircleFilled, LeftOutlined, MessageOutlined, PaperClipOutlined, SyncOutlined } from '@ant-design/icons';
import { SavingAffix } from 'components/SavingAffix';
import { useAssertRole } from 'hooks/useAssertRole';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import ClientTaskListPage from 'pages/ClientTask/ClientTaskListPage';
import { ClientTaskDocListPanel } from 'components/ClientTaskDocListPanel';
import { ZeventNoticeableBadge } from 'components/ZeventNoticeableBadge';
import { TaskDocToSignPanel } from 'components/TaskDocToSignPanel';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { ProCard } from '@ant-design/pro-components';
import { DefaultFooter } from '@ant-design/pro-components';
import { getPendingSignTaskDocs } from 'util/getPendingSignTaskDocs';
import { ClientTaskCommentDrawer } from 'components/ClientTaskCommentDrawer';
import { highlightGlow } from '../../util/highlightGlow';
import { AiOutlineForm } from 'react-icons/ai';
import { FaSignature } from 'react-icons/fa';
import { BiComment, BiCommentDetail } from 'react-icons/bi';

const { Text } = Typography;
const { useBreakpoint } = Grid;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // background-color: yellow;
  height: 100%;
  width: 100%;
  // max-width: 1200px;

.client-task-footer {
  .ant-btn {
    height: 64px;
    width: 100px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    &>.anticon+span {
      margin: 0 !important;
    }

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}  
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

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

const ClientTaskPage = (props) => {
  useAssertRole(['client']);
  const params = useParams();
  const { id } = params;

  const notificationType = useLocation()?.state?.type;

  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);
  const [currentStep, setCurrentStep] = React.useState(FLOW_STEPS.FILL_IN_FORM);
  const [docsToSign, setDocsToSign] = React.useState([]);
  const [requestChangeModal, requestChangeContextHolder] = Modal.useModal();
  const navigate = useNavigate();
  const signPanelRef = React.useRef();
  const commentPanelRef = React.useRef();
  const formPanelRef = React.useRef();
  const [activePanel, setActivePanel] = React.useState('comments');

  React.useEffect(() => {
    switch (notificationType) {
      case 'request-client-fields':
        highlightGlow(formPanelRef);
        break;
      case 'request-client-sign':
        highlightGlow(signPanelRef);
        break;
      case 'comment':
        highlightGlow(commentPanelRef);
        break;
      default:
        break;
    }
  }, [id, notificationType, signPanelRef, commentPanelRef, formPanelRef]);

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

  const hasDocToSign = true || docsToSign.length > 0;
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

  const handleHighlightenSignPanel = () => {
    highlightGlow(signPanelRef)
    setActivePanel('sign')
  }

  return (<Container>
    {!task ? <Skeleton active /> : <PageHeaderContainer
      loading={loading}
      onBack={handleGoBack}
      fixedHeader={true}
      maxWidth={700}
      icon={<TaskIcon />}
      title={<>{task.name} <small><Text type="secondary" strong={false}>by {task.orgName}</Text></small></> || <Skeleton paragraph={false} />}
      footer={<Space className='client-task-footer' size="large" style={{ width: '100%', margin: '0 auto', justifyContent: 'space-evenly' }}>
        <Button type="text" size="large" icon={<Icon component={BiCommentDetail} />}
          onClick={() => setActivePanel('comments')}
        >Chat</Button>
        {task.fields.length > 0 && <Button type="text" size="large" icon={<Icon component={AiOutlineForm} />}
          onClick={() => setActivePanel('form')}
        >Form</Button>}
        <Button type="text" size="large" icon={<PaperClipOutlined />}
          onClick={() => setActivePanel('docs')}
        >Docs</Button>
        {docsToSign.length > 0 && <Badge showZero={true} count={docsToSign.length}>
          <Button type="text" size="large" icon={<Icon component={FaSignature} />} onClick={handleHighlightenSignPanel} disabled={!hasDocToSign}>
            Sign
          </Button>
        </Badge>}
      </Space>}
      extra={[
        // <ZeventNoticeableBadge key="refresh"
        //   message="This task has changes. Click to refresh"
        //   filter={z => z.type === 'task.change' && z.taskId === task.id}
        // >
        //   <Button icon={<SyncOutlined />} onClick={() => load$()} />
        // </ZeventNoticeableBadge>,
        // <ZeventNoticeableBadge key="comment"
        //   message="This task has unread comment"
        //   filter={z => z.type === 'task.comment' && z.taskId === task.id}
        // >
        //   <Button icon={<MessageOutlined />} onClick={() => setCommentOpen(true)}>Comment</Button>
        // </ZeventNoticeableBadge>,
        // canRequestChange ? <Button key="request">Request change</Button> : null,
        // task.status === 'action_required' ? <Button key="submit" type="primary">Submit</Button> : null,
      ]}
    >
      {/* <DebugJsonPanel value={screens} /> */}
      {/* {alertMeta && <Alert
        type={alertMeta.type}
        icon={alertMeta.icon}
        message={alertMeta.message}
        description={alertMeta.description}
        showIcon
        style={{ marginBottom: 30 }} />} */}

      {activePanel === 'form' && <ProCard title="Form" ref={formPanelRef}>
        <AutoSaveTaskFormPanel value={task} mode="client" onSavingChange={setSaving} />
      </ProCard>}
      {activePanel === 'docs' && <ProCard ghost>
        <ClientTaskDocListPanel
          task={task}
          onSavingChange={setSaving}
          onChange={handleDocChange}
          disabled={!canEdit}
          placeholder="Upload attachments"
        />
      </ProCard>}
      {activePanel === 'sign' && <ProCard
        title={`${docsToSign.length} Document Waiting for Your Signature`}
        bodyStyle={{ paddingLeft: 16, paddingRight: 16 }}
        ref={signPanelRef}
      >
        <TaskDocToSignPanel docs={task?.docs} onSavingChange={setSaving} onChange={handleDocChange} />
      </ProCard>}
      {activePanel === 'comments' && <ProCard size="small" ref={commentPanelRef}>
        <TaskCommentPanel taskId={task.id} />
      </ProCard>}
      {saving && <SavingAffix />}
    </PageHeaderContainer>}
    {/* <FooterToolbar>
      {hasDocToSign && <Button key="sign" type="primary" danger
        onClick={handleHighlightenSignPanel}
      >Sign {docsToSign.length} documents</Button>}
      {task?.status === 'action_required' && <Button key="submit" type="primary">Submit</Button>}
    </FooterToolbar> */}
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
