import { Button, Layout, Modal, Space, Typography, Tabs } from 'antd';

import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortfolio } from 'services/portfolioService';
import { PlusOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Divider } from 'antd';
import MyTaskList from 'pages/MyTask/MyTaskList';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { groupBy } from 'lodash';
import { Empty } from 'antd';
import { Loading } from 'components/Loading';
import { Tooltip } from 'antd';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';

const { Paragraph } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 600px;

  .ant-divider {
    margin: 8px 0 24px;
  }
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .task-count .ant-badge-count {
    background-color: #183e91;
    color: #eeeeee;
    // box-shadow: 0 0 0 1px #183e91 inset;
  }
`;


const ClientDashboardPage = (props) => {

  const context = React.useContext(GlobalContext);
  const { user, setUser } = context;
  const isProfileMissing = !user.givenName || !user.surname;
  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [portfolioList, setPortfolioList] = React.useState([]);
  const [taskListByPortfolioMap, setTaskListByPortfolioMap] = React.useState({});

  const loadList = async () => {
    setLoading(true);
    const portfolioList = await listPortfolio() || [];
    // const { data: toSignTaskList } = await searchTask({ status: ['to_sign'] });
    const list = await listTask();
    setTaskListByPortfolioMap(groupBy(list, 'portfolioId'));

    setPortfolioList(portfolioList);
    setLoading(false);
    if (isProfileMissing) {
      setProfileModalVisible(true);
    } else if (!portfolioList.length) {
      showNoPortfolioWarn();
    }
  }

  React.useEffect(() => {
    loadList()
  }, []);

  const showNoPortfolioWarn = () => {
    Modal.confirm({
      title: 'No portfolio',
      maskClosable: true,
      content: 'Please create portfolio before creating task. Go to create protofolio now?',
      okText: 'Yes, go to create portfolio',
      onOk: () => props.history.push('/portfolios?create=1')
    });
  }

  const createNewTask = (e, portfolioId) => {
    e.stopPropagation();
    if (portfolioList.length) {
      props.history.push(`/tasks/new?${portfolioId ? `portfolioId=${portfolioId}` : ''}`);
    } else {
      showNoPortfolioWarn();
    }
  }

  const handleGoToTask = task => {
    props.history.push(`/tasks/${task.id}?${task.lastUnreadMessageAt ? 'chat=1' : ''}`)
  }

  const handleSaveProfile = updatedUser => {
    setUser(updatedUser);
    setProfileModalVisible(false);
    if (!portfolioList.length) {
      showNoPortfolioWarn();
    }
  }

  return (
    <LayoutStyled>
      
      <ContainerStyled>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Link to="/tasks">All tasks</Link>
          <Button type="primary" onClick={createNewTask} icon={<PlusOutlined />}>New Task</Button>
        </Space>
        <Divider />
        <Paragraph type="secondary">This page lists out all tasks grouped by portfolio. You can go to the <Link to="/tasks">Tasks</Link> page to see all the tasks and go to the <Link to="/portfolios">Portfolios</Link> page to manage all your portfolios.</Paragraph>
        <Loading loading={loading}>
          <Tabs
            type="card"
            tabBarExtraContent={<Tooltip title="Create new portfolio"><Button type="link" onClick={() => props.history.push(`/portfolios?create=1`)} icon={<PlusOutlined />} /></Tooltip>}
          >
            {portfolioList.map((p, i) => <Tabs.TabPane key={i} tab={<Space size="small" direction="vertical" style={{ alignItems: 'center' }}>
              <PortfolioAvatar value={p.name} id={p.id} size={36} />
              {p.name}
            </Space>}
            >
              {taskListByPortfolioMap[p.id]?.length > 0 ?
                <MyTaskList data={taskListByPortfolioMap[p.id]} onItemClick={handleGoToTask} avatar={false} /> :
                <Space size="large" style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }} direction="vertical">
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tasks. Click below button to create a new task." />
                  {/* <Button type="primary" onClick={(e) => createNewTask(e, p.id)} icon={<PlusOutlined />}>Create New Task for {p.name}</Button> */}
                </Space>}

            </Tabs.TabPane>)}
          </Tabs>
        </Loading>
      </ContainerStyled>
      <Modal
        visible={profileModalVisible}
        destroyOnClose={true}
        maskClosable={false}
        closable={false}
        title="Set Profile"
        footer={null}
      >
        <Paragraph type="secondary">Please set up your profile to continue using the system.</Paragraph>
        <ProfileForm user={context.user} initial={true} onOk={user => handleSaveProfile(user)} />
      </Modal>
    </LayoutStyled >
  );
};

ClientDashboardPage.propTypes = {};

ClientDashboardPage.defaultProps = {};

export default withRouter(ClientDashboardPage);
