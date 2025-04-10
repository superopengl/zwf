import { Button, Row, Space, Pagination, Radio, Tooltip, Alert, Typography, Card, Segmented } from 'antd';
import React from 'react';
import { searchTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { catchError, finalize } from 'rxjs/operators';
import { HiOutlineViewBoards, HiOutlineViewList } from 'react-icons/hi';
import Icon, { FilterFilled, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { TaskBoardPanel } from './TaskBoardPanel';
import { TaskListPanel } from './TaskListPanel';
import { useLocalstorageState } from 'rooks';
import { TaskSearchPanel } from './TaskSearchPanel';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';
import { useCreateTaskModal } from 'hooks/useCreateTaskModal';
import { MdDashboardCustomize } from 'react-icons/md';
import { Drawer } from 'antd';
import { TaskSearchDrawer } from './TaskSearchDrawer';

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

const OrgArchivedTasksPage = () => {
  useAssertRole(['admin', 'agent']);
  const [loading, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [queryInfo, setQueryInfo] = useLocalstorageState(TASK_QUERY_KEY, DEFAULT_QUERY);
  const [filterVisible, setFilterVisible] = React.useState(false);

  React.useEffect(() => {
    const subscription = reloadWithQueryInfo$(queryInfo)
    return () => subscription.unsubscribe()
  }, []);

  const reloadWithQueryInfo$ = (queryInfo) => {
    setLoading(true);
    return searchTask$({ ...queryInfo, status: ['archived'], page: 1 })
      .pipe(
        finalize(() => setLoading(false))
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
    <PageHeaderContainer
      breadcrumb={[
        {
          name: 'Tasks'
        },
        {
          name: 'Archived Tasks',
        },
      ]}
      loading={loading}
      fixedHeader
      title='Archived Tasks'
      extra={[
        <Tooltip key="refresh" title="Refresh">
          <Button icon={<SyncOutlined />} onClick={handleReload} />
        </Tooltip>,
      ]}
    >
      <TaskSearchDrawer 
        open={filterVisible}
        onClose={() => setFilterVisible(false)}
        queryInfo={queryInfo}
        onSearch={handleFilterSearch}
      />

      <LayoutStyled direction="vertical" size="large">
        <TaskListPanel tasks={taskList} onChange={handleReload} searchText={queryInfo.text} onChangeFitler={() => setFilterVisible(true)}/>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Pagination size="small" onChange={handlePaginationChange}
            total={queryInfo.total} showSizeChanger={true} pageSize={queryInfo.size} />
        </Space>
      </LayoutStyled>
    </PageHeaderContainer>
  )
}

OrgArchivedTasksPage.propTypes = {};

OrgArchivedTasksPage.defaultProps = {};

export default OrgArchivedTasksPage;