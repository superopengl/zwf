import { Badge, Button, Layout, Modal, Space, Tabs, Typography } from 'antd';

import React from 'react';
import { withRouter } from 'react-router-dom';
import { listTask } from 'services/taskService';
import { listPortfolio } from 'services/portfolioService';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import MyTaskList from './MyTaskList';

const { Title } = Typography;
const { TabPane } = Tabs;


const ContainerStyled = styled.div`
  margin: 6rem auto 2rem auto;
  padding: 0 1rem;
  width: 100%;
  max-width: 600px;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

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


const MyTaskListPage = (props) => {

  const [, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [portfolioList, setPortfolioList] = React.useState([]);


  const loadList = async () => {
    setLoading(true);
    const portfolioList = await listPortfolio() || [];

    const list = await listTask();

    setTaskList(list);
    setPortfolioList(portfolioList);
    setLoading(false);
  }


  React.useEffect(() => {
    loadList();
  }, [])

  const createNewTask = () => {
    if (!portfolioList.length) {
      Modal.confirm({
        title: 'No portfolio',
        maskClosable: true,
        content: 'Please create portfolio before creating task. Go to create protofolio now?',
        okText: 'Yes, go to create portfolio',
        onOk: () => props.history.push('/portfolios')
      });
      return;
    }
    props.history.push(`/task/new`);
  }

  const handleItemClick = task => {
    props.history.push(`/tasks/${task.id}?${task.lastUnreadMessageAt ? 'chat=1' : ''}`);
  }


  const RenderListFilteredByStatus = (statuses = []) => {
    const data = taskList.filter(x => statuses.includes(x.status));

    return <MyTaskList data={data} onItemClick={handleItemClick}/>
  }

  return (
    <LayoutStyled>
      
      <ContainerStyled>
        <Space size="large" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Tasks</Title>
          </StyledTitleRow>
          <Tabs defaultActiveKey="todo" type="card" tabBarExtraContent={{ right: <Button type="link" onClick={() => loadList()} icon={<SyncOutlined />}></Button> }}>
            <TabPane tab={<>To Do <Badge count={taskList.filter(x => ['todo', 'signed'].includes(x.status) && !x.lastUnreadMessageAt).length} showZero={false} /></>} key="todo">
              {RenderListFilteredByStatus(['todo', 'signed'])}
            </TabPane>
            <TabPane tab={<>To Sign <Badge count={taskList.filter(x => ['to_sign'].includes(x.status)).length} showZero={false} /></>} key="ongoing">
              {RenderListFilteredByStatus(['to_sign'])}
            </TabPane>
            <TabPane tab={"Completed"} key="complete">
              {RenderListFilteredByStatus(['complete'])}
            </TabPane>
          </Tabs>
        </Space>
      </ContainerStyled>
    </LayoutStyled >
  );
};

MyTaskListPage.propTypes = {};

MyTaskListPage.defaultProps = {};

export default withRouter(MyTaskListPage);
