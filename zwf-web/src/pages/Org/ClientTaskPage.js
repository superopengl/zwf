import React from 'react';

import styled from 'styled-components';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Typography, Row, Badge, Skeleton, Button, Grid } from 'antd';

import { getTask$ } from 'services/taskService';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { TaskCommentInputForm } from 'components/TaskCommentInputForm';
import { TaskCommentDisplayPanel } from 'components/TaskCommentDisplayPanel';
import { finalize } from 'rxjs/operators';
import Icon, { CommentOutlined, ExclamationCircleFilled, PaperClipOutlined } from '@ant-design/icons';
import { SavingAffix } from 'components/SavingAffix';
import { useAssertRole } from 'hooks/useAssertRole';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { ClientTaskDocListPanel } from 'components/ClientTaskDocListPanel';
import { TaskDocToSignPanel } from 'components/TaskDocToSignPanel';
import { ProCard } from '@ant-design/pro-components';
import { getPendingSignTaskDocs } from 'util/getPendingSignTaskDocs';
import { AiOutlineForm } from 'react-icons/ai';
import { RiQuillPenFill } from 'react-icons/ri';
import { TaskUnreadCommentBadge } from 'components/TaskUnreadCommentBadge';
import { TaskContext } from 'contexts/TaskContext';
import { TaskRequestFillFormBadge } from 'components/TaskRequestFillFormBadge';

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
    border: none;
    height: 64px;
    // width: 100px;
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

// .ant-btn-primary {
//   .anticon {
//     color: #0FBFC4;
//   }
// }
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
      Please review any comment left by your agent as instructions.
    </>,
  },
  'done': {
    type: 'success',
    message: 'Completed',
    description: 'The task has been successfully completed.'
  },
}


const ClientTaskPage = () => {
  useAssertRole(['client']);
  const params = useParams();
  const { id } = params;

  const notificationType = useLocation()?.state?.type;

  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);
  const [docsToSign, setDocsToSign] = React.useState([]);
  const navigate = useNavigate();
  const signPanelRef = React.useRef();
  const commentPanelRef = React.useRef();
  const formPanelRef = React.useRef();
  const [activePanel, setActivePanel] = React.useState('chat');
  const screens = useBreakpoint();


  React.useEffect(() => {
    switch (notificationType) {
      case 'request-client-fill-form':
        setActivePanel('form')
        // highlightGlow(formPanelRef);
        break;
      case 'request-client-sign':
        setActivePanel('sign')
        // highlightGlow(signPanelRef);
        break;
      case 'chat':
        setActivePanel('chat')
        // highlightGlow(commentPanelRef);
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

  const load$ = () => {
    setLoading(true);
    const sub$ = getTask$(id)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(setTask)

    return sub$;
  }

  const handleDocChange = () => {
    load$();
  }

  const handleGoBack = () => {
    navigate('/task');
  }


  const canEdit = task?.status === 'action_required' || task?.status === 'in_progress';
  const narrowScreen = (screens.xs || screens.sm) && !screens.md;


  const hasDocToSign = true || docsToSign.length > 0;


  const handleHighlightenSignPanel = () => {
    // highlightGlow(signPanelRef)
    setActivePanel('sign')
  }


  const buttonSize = narrowScreen ? 'default' : 'large';

  return (<Container>
    {!task ? <Skeleton active /> : <TaskContext.Provider value={{ task, setTask }} >
      <PageHeaderContainer
        loading={loading}
        onBack={handleGoBack}
        fixedHeader={true}
        maxWidth={700}
        // icon={<TaskIcon />}
        title={task.name || <Skeleton paragraph={false} />}
        footer={<Row className='client-task-footer' justify="space-around" wrap={false}>
          <TaskUnreadCommentBadge taskId={task.id} offset={[-8, 10]}>
            <Button size={buttonSize} icon={<CommentOutlined />}
              type={activePanel === 'chat' ? 'primary' : 'text'}
              ghost={activePanel === 'chat'}
              onClick={() => setActivePanel('chat')}
            >Chat</Button>
          </TaskUnreadCommentBadge>
          <TaskRequestFillFormBadge taskId={task.id} offset={[-8, 10]}>
            <Button size={buttonSize} icon={<Icon component={AiOutlineForm} />}
              type={activePanel === 'form' ? 'primary' : 'text'}
              ghost={activePanel === 'form'}
              disabled={!task.fields.length}
              onClick={() => setActivePanel('form')}
            >Form</Button>
          </TaskRequestFillFormBadge>
          <Button size={buttonSize} icon={<PaperClipOutlined />}
            type={activePanel === 'docs' ? 'primary' : 'text'}
            ghost={activePanel === 'docs'}
            onClick={() => setActivePanel('docs')}
          >Docs</Button>
          <Badge showZero={false} count={docsToSign.length} offset={[-8, 10]}>
            <Button size={buttonSize} icon={
              <Icon component={RiQuillPenFill} />}
              type={activePanel === 'sign' ? 'primary' : 'text'}
              ghost={activePanel === 'sign'}
              disabled={!docsToSign.length}
              onClick={handleHighlightenSignPanel}>
              Sign
            </Button>
          </Badge>
        </Row>}
        extra={[
        ]}
      >
        {activePanel === 'form' && <ProCard title="Form" ref={formPanelRef}>
          <AutoSaveTaskFormPanel
            value={task}
            mode="client"
            onLoading={setSaving}
            autoSave={false}
          />
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
        {activePanel === 'chat' && <ProCard size="small" ghost ref={commentPanelRef} bodyStyle={{ padding: '12px 0' }}>
          <TaskCommentDisplayPanel taskId={task.id} />
          <div style={{ padding: 12 }}>
            <TaskCommentInputForm taskId={task.id} />
          </div>
        </ProCard>}
        {saving && <SavingAffix />}
      </PageHeaderContainer>
    </TaskContext.Provider >}
    {/* <FooterToolbar>
      {hasDocToSign && <Button key="sign" type="primary" danger
        onClick={handleHighlightenSignPanel}
      >Sign {docsToSign.length} documents</Button>}
      {task?.status === 'action_required' && <Button key="submit" type="primary">Submit</Button>}
    </FooterToolbar> */}
    {/* {requestChangeContextHolder} */}
  </Container >
  );
};

ClientTaskPage.propTypes = {
  // id: PropTypes.string.isRequired
};

ClientTaskPage.defaultProps = {
  // taskId: 'new'
};

export default ClientTaskPage;
