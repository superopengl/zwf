import React from 'react';

import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Steps, Space, Typography, Row, Col, Card, Skeleton, Button, Grid } from 'antd';

import { getTask$, listTaskComment$ } from 'services/taskService';
import { Loading } from 'components/Loading';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { TaskMessageForm } from 'components/TaskMessageForm';
import { TaskCommentPanel } from 'components/TaskCommentPanel';
import { combineLatest } from 'rxjs';
import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { finalize } from 'rxjs/operators';
import { TaskIcon } from 'components/entityIcon';
import { CommentOutlined, LeftOutlined, MessageOutlined, SyncOutlined } from '@ant-design/icons';
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

const { Text } = Typography;
const { useBreakpoint } = Grid;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // background-color: yellow;
  height: 100%;
  width: 100%;
  // max-width: 1200px;

`;

const FLOW_STEPS = {
  FILL_IN_FORM: 0,
  ATTACHMENTS: 1,
  SIGN_DOCS: 2,
}

const ClientTaskPage = (props) => {
  useAssertRole(['client']);
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);
  const [currentStep, setCurrentStep] = React.useState(FLOW_STEPS.FILL_IN_FORM);
  const [historyVisible, setHistoryVisible] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe();
  }, [])

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
    navigate(-1);
  }

  const isFormView = currentStep === 0;
  const isDocView = currentStep === 1;
  const screens = useBreakpoint();

  const span = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12, xxl: 12 };
  const canRequestChange = task?.status === 'todo' || task?.status === 'in_progress';
  const canEditForm = task?.status === 'action_required';
  const narrowScreen = (screens.xs || screens.sm) && !screens.md;

  const getInitialStep = (task) => {
    if (canEditForm) {
      return FLOW_STEPS.FILL_IN_FORM;
    }
  }

  return (<Container>
    {!task ? <Skeleton active /> : <PageHeaderContainer
      loading={loading}
      onBack={handleGoBack}
      fixedHeader={true}
      maxWidth={1000}
      icon={<TaskIcon />}
      title={<>{task?.name} <small><Text type="secondary">by {task?.orgName}</Text></small></> || <Skeleton paragraph={false} />}
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
          <Button icon={<MessageOutlined />} onClick={() => setHistoryVisible(true)}>Comment & Log</Button>
        </ZeventNoticeableBadge>,
        canRequestChange ? <Button key="request">Request change</Button> : null,
      ]}
    >
      {/* <DebugJsonPanel value={screens} /> */}
      <Row gutter={[40, 40]}>
        <Col>
          <Steps
            direction={narrowScreen ? 'horizontal' : 'vertical'}
            progressDot={narrowScreen}
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
              {
                title: 'Sign documents',
              },
            ]}
          />
        </Col>
        <Col flex="auto">
          {currentStep === FLOW_STEPS.FILL_IN_FORM && <ProCard title="Information Form" type="inner">
            <AutoSaveTaskFormPanel value={task} mode="client" onSavingChange={setSaving} />
          </ProCard>}
          {currentStep === FLOW_STEPS.ATTACHMENTS && <ClientTaskDocListPanel task={task} onSavingChange={setSaving} onChange={handleDocChange} />}
          {currentStep === FLOW_STEPS.SIGN_DOCS && <TaskDocToSignPanel docs={task.docs} onSavingChange={setSaving} onChange={handleDocChange} />}
        </Col>
      </Row>
      {saving && <SavingAffix />}
    </PageHeaderContainer>}
    {task && <TaskLogAndCommentDrawer taskId={task.id} userId={task.userId} visible={historyVisible} onClose={() => setHistoryVisible(false)} />}
    {task && <TaskDocToSignDrawer docs={task.docs} />}
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
