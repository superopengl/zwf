import React from 'react';

import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Space, Typography, Row, Col, Card, Skeleton } from 'antd';

import { getTask$, listTaskComment$ } from 'services/taskService';
import { Loading } from 'components/Loading';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { TaskMessageForm } from 'components/TaskMessageForm';
import { TaskCommentPanel } from 'components/TaskCommentPanel';
import { combineLatest } from 'rxjs';
import { PageContainer } from '@ant-design/pro-components';
import { finalize } from 'rxjs/operators';
import { TaskIcon } from 'components/entityIcon';
import { LeftOutlined } from '@ant-design/icons';
import { SavingAffix } from 'components/SavingAffix';
import { useAssertRole } from 'hooks/useAssertRole';
import { PageHeaderContainer } from 'components/PageHeaderContainer';

const { Text } = Typography;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
  width: 100%;
  max-width: 1200px;
`;

const ClientTaskPage = (props) => {
  useAssertRole(['client']);
  const params = useParams();
  const {id} = params;

  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const sub$ = getTask$(id).pipe(
      finalize(() => setLoading(false))
    ).subscribe(task => {
      setTask(task);
    })

    return () => sub$.unsubscribe();
  }, [])

  const handleMessageSent = () => {
    setLoading(false);
  }

  const handleGoBack = () => {
    navigate(-1);
  }

  return (<>
    <Container>
      {!task ? <Skeleton active /> : <PageHeaderContainer
        loading={loading}
        onBack={handleGoBack}
        // fixedHeader
        icon={<TaskIcon />}
        title={<>{task?.name} <small><Text type="secondary">by {task?.orgName}</Text></small></> || <Skeleton paragraph={false} />}
      >
        <Row gutter={40} wrap={false}>
          <Col span={14}>
            <Card size="large">
              <AutoSaveTaskFormPanel value={task} mode="client" onSavingChange={setSaving} />
            </Card>
          </Col>
          <Col span={10} >
            <Card
              bordered={false}
              title="Comment"
              size="large"
              bodyStyle={{ overflowX: 'hidden', overflowY: 'auto' }}
              // actions={[
              //   <div style={{ paddingLeft: 24, paddingRight: 24, width: '100%' }}>
              //     <TaskMessageForm key="0" taskId={task.id} loading={loading} onDone={handleMessageSent} />
              //   </div>
              // ]}
            >
              <TaskCommentPanel taskId={task.id} />
            </Card>
          </Col>
        </Row>
      </PageHeaderContainer>}
      {saving && <SavingAffix />}
    </Container>
  </>
  );
};

ClientTaskPage.propTypes = {
  // id: PropTypes.string.isRequired
};

ClientTaskPage.defaultProps = {
  // taskId: 'new'
};

export default ClientTaskPage;
