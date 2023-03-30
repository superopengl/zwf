import React from 'react';

import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Steps, Space, Typography, Row, Col, Card, Skeleton, Button, Tabs } from 'antd';

import { getTask$, listTaskComment$ } from 'services/taskService';
import { Loading } from 'components/Loading';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { TaskMessageForm } from 'components/TaskMessageForm';
import { TaskCommentPanel } from 'components/TaskCommentPanel';
import { combineLatest } from 'rxjs';
import { FooterToolbar, PageContainer } from '@ant-design/pro-components';
import { finalize } from 'rxjs/operators';
import { TaskIcon } from 'components/entityIcon';
import { CommentOutlined, LeftOutlined, MessageOutlined } from '@ant-design/icons';
import { SavingAffix } from 'components/SavingAffix';
import { useAssertRole } from 'hooks/useAssertRole';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import ClientTaskListPage from 'pages/ClientTask/ClientTaskListPage';
import { ClientTaskDocListPanel } from 'components/ClientTaskDocListPanel';
import { TaskLogAndCommentCommentDrawer } from 'components/TaskLogAndCommentCommentDrawer';

const { Text } = Typography;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // background-color: yellow;
  height: 100%;
  width: 100%;
  // max-width: 1200px;

`;

const ClientTaskPage = (props) => {
  useAssertRole(['client']);
  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);
  const [currentStep, setCurrentStep] = React.useState(0);
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

  const span = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12, xxl: 12 };
  const canRequestChange = task?.status === 'todo' || task?.status === 'in_progress';

  return (<Container>
    {!task ? <Skeleton active /> : <PageHeaderContainer
      loading={loading}
      onBack={handleGoBack}
      fixedHeader={true}
      maxWidth={1200}
      icon={<TaskIcon />}
      title={<>{task?.name} <small><Text type="secondary">by {task?.orgName}</Text></small></> || <Skeleton paragraph={false} />}
      // footer={<Button type="primary">Submit</Button>}
      extra={[
        <Button icon={<MessageOutlined />} onClick={() => setHistoryVisible(true)}>Comment & Log</Button>,
        canRequestChange ?  <Button>Request change</Button> : null,
      ]}
    >
      <Row gutter={[40, 40]}>
        <Col {...span}>
          <Card key="form">
            <AutoSaveTaskFormPanel value={task} mode="client" onSavingChange={setSaving} />
          </Card>
        </Col>
        <Col {...span}>
            <ClientTaskDocListPanel task={task} onSavingChange={setSaving} onChange={handleDocChange}/>
        </Col>
      </Row>
      {saving && <SavingAffix />}
    </PageHeaderContainer>}
    {task && <TaskLogAndCommentCommentDrawer taskId={task.id} userId={task.userId} visible={historyVisible} onClose={() => setHistoryVisible(false)} />}
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
