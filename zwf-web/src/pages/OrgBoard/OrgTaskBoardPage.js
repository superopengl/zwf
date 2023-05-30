import { Button, Row, Space, Pagination, Radio, Tooltip, Alert, Typography, Card, Segmented } from 'antd';
import React from 'react';
import { searchTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { catchError, finalize } from 'rxjs/operators';
import { HiOutlineViewBoards, HiOutlineViewList, HiViewBoards, HiViewList } from 'react-icons/hi';
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
import { TaskBoardContext } from 'contexts/TaskBoardContext';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { TaskSearchFilterButton } from 'pages/OrgBoard/TaskSearchFilterButton';

const { Link: TextLink } = Typography;

const LayoutStyled = styled(Space)`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  // height: 100%;
  width: 100%;
`;

const TASK_QUERY_KEY = 'tasks.filter.board';

const DEFAULT_QUERY = {
  text: '',
  page: 1,
  size: 200,
  total: 0,
  status: ['todo', 'in_progress', 'action_required', 'done'],
  orderField: 'updatedAt',
  orderDirection: 'DESC'
};


const OrgTaskBoardPage = () => {
  useAssertRole(['admin', 'agent']);
  const [loading, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [queryInfo, setQueryInfo] = useLocalstorageState(TASK_QUERY_KEY, DEFAULT_QUERY);

  React.useEffect(() => {
    const subscription = reloadWithQueryInfo$(queryInfo)
    return () => subscription.unsubscribe()
  }, []);


  // React.useEffect(() => {
  //   if (viewMode === 'board') {
  //     setMessage(<>Board view doesn't show archived tasks. You can switch to <TextLink onClick={handleSwitchToListView}>list view</TextLink> to see all tasks including archived ones.</>);
  //   } else {
  //     setMessage(null);
  //   }
  // }, [viewMode]);


  const reloadWithQueryInfo$ = (queryInfo) => {
    setLoading(true);
    return searchTask$({ ...queryInfo, page: 1 })
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
          name: 'Board',
        },
      ]}
      loading={loading}
      fixedHeader
      title={'Task Board'}
      extra={[
        <TaskSearchFilterButton
          key="search"
          value={queryInfo}
          onChange={handleFilterSearch}
          defaultQuery={DEFAULT_QUERY} />,
      ]}
    >

      <LayoutStyled direction="vertical" size="large">
        <TaskBoardPanel tasks={taskList} onChange={handleReload} searchText={queryInfo.text} />

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Pagination size="small" onChange={handlePaginationChange}
            total={queryInfo.total} showTotal={t => `Total ${t}`} showSizeChanger={true} pageSize={queryInfo.size} />
        </Space>
      </LayoutStyled>
    </PageHeaderContainer>
  )
}

OrgTaskBoardPage.propTypes = {};

OrgTaskBoardPage.defaultProps = {};

export default OrgTaskBoardPage;