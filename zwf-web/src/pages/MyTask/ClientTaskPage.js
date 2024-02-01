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
  const isNew = !id || id === 'new';

  const { chat } = queryString.parse(props.location.search);
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

  return (<>
    <Container>
      {!task ? <Loading /> : <PageContainer
        loading={loading}
        backIcon={false}
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
          <Col span={12}>
            <Card size="large">
              <TaskTrackingPanel taskId={task.id} />
              <TaskMessageForm taskId={task.id} loading={loading} onDone={handleMessageSent} />
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
