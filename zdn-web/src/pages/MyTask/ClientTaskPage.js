import React from 'react';

import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Space, Button } from 'antd';

import { getTask } from 'services/taskService';
import MyTaskSign from './MyTaskSign';
import TaskFormWizard from './TaskFormWizard';
import MyTaskReadView from './MyTaskReadView';
import * as queryString from 'query-string';
import { MessageFilled } from '@ant-design/icons';
import TaskChatPanel from 'pages/AdminTask/TaskChatPanel';
import { TaskStatus } from 'components/TaskStatus';
import { Loading } from 'components/Loading';

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
  background-color: #ffffff;
  height: 100%;
`;

const GuestTaskPage = (props) => {
  const id = props.match.params.id;
  const isNew = !id || id === 'new';

  const { chat, portfolioId } = queryString.parse(props.location.search);
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));
  const [loading, setLoading] = React.useState(true);
  const [task, setTask] = React.useState();

  const loadEntity = async () => {
    setLoading(true);
    if (id && !isNew) {
      const task = await getTask(id);
      setTask(task);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
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

  const showsEditableForm = isNew || task?.status === 'todo';
  const showsSign = task?.status === 'to_sign';
  const showsChat = !isNew;

  return (<>
  Client task page
    <LayoutStyled>
        {loading ? <Loading /> : <Layout style={{ backgroundColor: '#ffffff', height: '100%', justifyContent: 'center' }}>
          <Layout.Content style={{ padding: 0, maxWidth: 500, margin: '0 auto', width: '100%' }}>
            {!isNew && <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
              <TaskStatus status={task.status} avatar={false} portfolioId={task.portfolioId} width={60} />
              <Button type={chatVisible ? 'secondary' : 'primary'} size="large" icon={<MessageFilled />} onClick={() => toggleChatPanel()}></Button>
            </Space>}
            {showsEditableForm ? <TaskFormWizard onOk={onOk} onCancel={onCancel} portfolioId={portfolioId} value={task} /> :
              showsSign ? <MyTaskSign value={task} /> :
                <MyTaskReadView value={task} />}
          </Layout.Content>
          {showsChat && <Layout.Sider collapsed={!chatVisible} reverseArrow={true} collapsedWidth={0} width={400} collapsible={false} theme="light" style={{ paddingLeft: 30, height: '100%' }}>
            <TaskChatPanel taskId={task.id} />
          </Layout.Sider>}
        </Layout>}
    </LayoutStyled>
  </>
  );
};

GuestTaskPage.propTypes = {
  // id: PropTypes.string.isRequired
};

GuestTaskPage.defaultProps = {
  // taskId: 'new'
};

export default withRouter(GuestTaskPage);
