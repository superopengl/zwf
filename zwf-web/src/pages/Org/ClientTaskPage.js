import React from 'react';

import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Space, Typography, Row, Col, Card, Skeleton } from 'antd';

import { getTask$, listTaskTrackings$ } from 'services/taskService';
import { Loading } from 'components/Loading';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { TaskMessageForm } from 'components/TaskMessageForm';
import { TaskTrackingPanel } from 'components/TaskTrackingPanel';
import { combineLatest } from 'rxjs';
import { PageContainer } from '@ant-design/pro-components';
import { finalize } from 'rxjs/operators';
import { TaskIcon } from 'components/entityIcon';
import { LeftOutlined } from '@ant-design/icons';
import { SavingAffix } from 'components/SavingAffix';

const { Text } = Typography;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
  width: 100%;
  max-width: 1200px;
`;

const ClientTaskPage = (props) => {
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
      {!task ? <Skeleton active /> : <PageContainer
        loading={loading}
        backIcon={<LeftOutlined />}
        onBack={handleGoBack}
        ghost={true}
        // fixedHeader
        header={{
          title: <Space style={{ height: 34 }}>
            <TaskIcon />
            {task?.name || <Skeleton paragraph={false} />}
          </Space>
        }}
      >
        <Row gutter={40} wrap={false}>
          <Col span={16}>
            <Card size="large">
              <AutoSaveTaskFormPanel value={task} mode="client" onSavingChange={setSaving} />
            </Card>
          </Col>
          <Col span={8} >
            <Card
              bordered={false}
              title="Interactions & Messages"
              size="large"
              bodyStyle={{ height: 'calc(100vh - 380px)', overflowX: 'hidden', overflowY: 'auto', padding: '0 8px' }}
              actions={[
                <div style={{ paddingLeft: 24, paddingRight: 24, width: '100%' }}>
                  <TaskMessageForm key="0" taskId={task.id} loading={loading} onDone={handleMessageSent} />
                </div>
              ]}
            >
              <TaskTrackingPanel taskId={task.id} />
            </Card>
          </Col>
        </Row>
      </PageContainer>}
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
