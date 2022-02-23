import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Space, Typography, Row, Col, Card, Skeleton } from 'antd';

import { getTask, getTask$, listTaskTrackings$ } from 'services/taskService';
import MyTaskSign from './MyTaskSign';
import { TaskFormWizard } from './TaskFormWizard';
import MyTaskReadView from './MyTaskReadView';
import * as queryString from 'query-string';
import { MessageFilled } from '@ant-design/icons';
import { TaskStatus } from 'components/TaskStatus';
import { Loading } from 'components/Loading';
import { TaskTrackingDrawer } from 'components/TaskTrackingDrawer';
import { AutoSaveTaskFormPanel } from 'components/AutoSaveTaskFormPanel';
import { TaskMessageForm } from 'components/TaskMessageForm';
import { TaskTrackingPanel } from 'components/TaskTrackingPanel';
import { combineLatest } from 'rxjs';
import { PageContainer } from '@ant-design/pro-layout';
import { finalize } from 'rxjs/operators';
import { TaskIcon } from 'components/entityIcon';

const { Text } = Typography;

const ContainerStyled = styled(Layout.Content)`
margin: 4rem auto 0 auto;
padding: 2rem 1rem;
// text-align: center;
max-width: 1000px;
width: 100%;
height: 100%;

.ant-layout-sider-zero-width-trigger {
  top: 0;
  left: -60px;
  width: 40px;
  border: 1px solid rgb(217,217,217);
  border-radius:4px;
}
`;


const LayoutStyled = styled.div`
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
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));
  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();
  const [list, setList] = React.useState([]);
  const [saving, setSaving] = React.useState(null);

  React.useEffect(() => {
    const sub$ = combineLatest([getTask$(id), listTaskTrackings$(id)])
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(([task, list]) => {
        setTask(task);
        setList(list);
      })

    return () => sub$.unsubscribe();
  }, [])

  const onOk = () => {
    props.history.push('/tasks');
  }
  const onCancel = () => {
    props.history.goBack();
  }

  const toggleChatPanel = () => {
    setChatVisible(!chatVisible);
  }

  const handleMessageSent = () => {
    listTaskTrackings$(id).subscribe(setList);
  }


  const showsEditableForm = isNew || task?.status === 'todo';
  const showsSign = task?.status === 'to_sign';
  const showsChat = !isNew;

  return (<>
    Client task page
    <LayoutStyled>
      {!task ? <Loading /> : <PageContainer
              loading={loading}
              backIcon={false}
              ghost={true}
              fixedHeader
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
              <TaskTrackingPanel dataSource={list} />
              <TaskMessageForm taskId={task.id} loading={loading} onDone={handleMessageSent} />
            </Card>
          </Col>
        </Row>
      </PageContainer>}
    </LayoutStyled>
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
