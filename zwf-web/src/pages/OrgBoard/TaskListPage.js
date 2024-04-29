import { Button, Row, Space, Pagination, Radio, Tooltip, Drawer, Alert, Typography, PageHeader, Layout, Card } from 'antd';
import React from 'react';

import { searchTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { catchError } from 'rxjs/operators';
import { HiOutlineViewBoards, HiOutlineViewList } from 'react-icons/hi';
import Icon, { FilterFilled, FilterOutlined, SyncOutlined } from '@ant-design/icons';
import { TaskBoardPanel } from './TaskBoardPanel';
import { TaskListPanel } from './TaskListPanel';
import { reactLocalStorage } from 'reactjs-localstorage';
import { IoRefreshOutline } from 'react-icons/io5';
import { TaskSearchDrawer } from './TaskSearchDrawer';
import { useLocalstorageState } from 'rooks';
import { TaskSearchPanel } from './TaskSearchPanel';

const { Link: TextLink } = Typography;

const LayoutStyled = styled(Space)`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  // height: 100%;
  width: 100%;
`;

const TASK_QUERY_KEY = 'tasks.filter';

const DEFAULT_QUERY = {
  text: '',
  page: 1,
  size: 200,
  total: 0,
  status: ['todo', 'in_progress', 'action_required', 'done'],
  orderField: 'updatedAt',
  orderDirection: 'DESC'
};

const TASK_BOARD_VIEW_WARNING = 'task.boardView.closed';

const TaskListPage = () => {
  const [loading, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [viewMode, setViewMode] = React.useState('board');
  const [queryInfo, setQueryInfo] = useLocalstorageState(TASK_QUERY_KEY, DEFAULT_QUERY);
  const [messageClosed, setMessageClosed] = useLocalstorageState(TASK_BOARD_VIEW_WARNING, false);
  const [filterVisible, setFilterVisible] = React.useState(false);
  const [message, setMessage] = React.useState();

  React.useEffect(() => {
    const subscription = reloadWithQueryInfo$(queryInfo)
    return () => subscription.unsubscribe()
  }, []);

  React.useEffect(() => {
    if (viewMode === 'board') {
      setMessage(<>Board view doesn't show archived tasks. You can switch to <TextLink onClick={handleSwitchToListView}>list view</TextLink> to see all tasks including archived ones.</>);
    } else {
      setMessage(null);
    }
  }, [viewMode]);

  const handleSwitchToListView = () => {
    setViewMode('list');
    setMessage(null);
  }

  const reloadWithQueryInfo$ = (queryInfo) => {
    setLoading(true);
    return searchTask$({ ...queryInfo, page: 1 })
      .pipe(
        catchError(() => setLoading(false))
      )
      .subscribe(resp => {
        setTaskList(resp.data);
        setQueryInfo(q => ({
          ...q,
          ...resp.pagination,
        }))
        setLoading(false);
      });
  }

  const onChangeViewMode = e => {
    setViewMode(e.target.value);
  }

  const handleReload = () => {
    reloadWithQueryInfo$(queryInfo)
  }

  const handlePaginationChange = (page, size) => {
    const newQueryInfo = {
      ...queryInfo,
      page,
      size
    }
    reloadWithQueryInfo$(newQueryInfo);
  }

  const handleFilterSearch = newQueryInfo => {
    setQueryInfo({ ...newQueryInfo });
    reloadWithQueryInfo$(newQueryInfo);
  }

  return (
    <PageHeader
      loading={loading}
      title={viewMode === 'board' ? 'Task Board' : 'Task List'}
      extra={[
        <Tooltip key="refresh" title="Refresh">
          <Button icon={<SyncOutlined />} onClick={handleReload} />
        </Tooltip>,
        <Radio.Group key="view" buttonStyle="solid" onChange={onChangeViewMode} value={viewMode}>
          <Tooltip title="Board view">
            <Radio.Button value="board">
              <Icon component={HiOutlineViewBoards } />
            </Radio.Button>
          </Tooltip>
          <Tooltip title="List view">
            <Radio.Button value="list">
              <Icon component={HiOutlineViewList } />
            </Radio.Button>
          </Tooltip>
        </Radio.Group>,

        <Tooltip key="filter" title="Filter">
          <Button icon={<FilterFilled />} type={filterVisible ? 'primary' : 'default'} onClick={() => setFilterVisible(x => !x)} >Filter</Button>
        </Tooltip>,
      ]}
    >
      {filterVisible && <Row style={{ marginBottom: 20 }}>
        <Card
          style={{ width: "100%" }}
          size="small">
          <TaskSearchPanel queryInfo={queryInfo} onChange={handleFilterSearch} />
        </Card>
      </Row>}

      <LayoutStyled direction="vertical" size="large">
        {!messageClosed && message && <Alert type="warning" showIcon closable description={message} onClose={() => setMessageClosed(true)} />}

        {viewMode === 'board' && <TaskBoardPanel tasks={taskList} onChange={handleReload} searchText={queryInfo.text} />}
        {viewMode === 'list' && <TaskListPanel tasks={taskList} onChange={handleReload} searchText={queryInfo.text} />}

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Pagination size="small" onChange={handlePaginationChange}
            total={queryInfo.total} showSizeChanger={true} pageSize={queryInfo.size} />
        </Space>
      </LayoutStyled>
      {/* <TaskSearchDrawer
        queryInfo={queryInfo}
        onChange={handleFilterSearch}
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
      /> */}
    </PageHeader>
  )
}

TaskListPage.propTypes = {};

TaskListPage.defaultProps = {};

export default TaskListPage;