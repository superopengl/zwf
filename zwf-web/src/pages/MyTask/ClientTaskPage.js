import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Space, Typography, Row, Col, Card, Skeleton } from 'antd';

import { getTask$, listTaskTrackings$ } from 'services/taskService';
import * as queryString from 'query-string';
import { Loading } from 'components/Loading';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { TaskMessageForm } from 'components/TaskMessageForm';
import { TaskTrackingPanel } from 'components/TaskTrackingPanel';
import { combineLatest } from 'rxjs';
import { PageContainer } from '@ant-design/pro-layout';
import { finalize } from 'rxjs/operators';
import { TaskIcon } from 'components/entityIcon';
import { LeftOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
  width: 100%;
  max-width: 1200px;
`;

const ClientTaskPage = (props) => {
  const id = props.match.params.id;

  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const [saving, setSaving] = React.useState(null);

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
    props.history.push('/');
  }

  return (<>
    <Container>
      {!task ? <Loading /> : <PageContainer
        loading={loading}
        backIcon={<LeftOutlined />}
        onBack={handleGoBack}
        ghost={true}
        // fixedHeader
        header={{
          title: <Space style={{ height: 34 }}>
            <TaskIcon />
            {task?.name || <Skeleton paragraph={false} />}
            {saving !== null && <Text type="secondary" style={{ fontSize: 'small', fontWeight: 'normal' }}>{saving ? 'saving...' : 'saved'}</Text>}
          </Space>
        }}
      >
        <Row gutter={40} wrap={false}>
          <Col span={12}>
            <Card size="large">
              <AutoSaveTaskFormPanel value={task} type="client" onSavingChange={setSaving} />
            </Card>
          </Col>
          <Col span={12} >
            <Card 
            bordered={false}
            title="Activity History"
            size="small"
            size="large" 
            bodyStyle={{height: 'calc(100vh - 420px)', overflowX: 'hidden', overflowY: 'auto', padding: '0 8px'}}
            actions={[
              <div style={{paddingLeft: 24, paddingRight: 24, width: '100%'}}>
                <TaskMessageForm  key="0" taskId={task.id} loading={loading} onDone={handleMessageSent} />
              </div>
            ]}
            >
              <TaskTrackingPanel taskId={task.id} />
            </Card>
          </Col>
        </Row>
      </PageContainer>}
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

export default withRouter(ClientTaskPage);
