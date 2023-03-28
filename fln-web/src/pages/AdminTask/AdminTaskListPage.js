import { DeleteOutlined, EditOutlined, SearchOutlined, SyncOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input, Layout, Modal, Select, Space, Row, Table, Tooltip, Typography, DatePicker, Pagination, Col } from 'antd';
import Text from 'antd/lib/typography/Text';

import { TaskStatus } from 'components/TaskStatus';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import Highlighter from "react-highlight-words";
import { Link } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { assignTask, deleteTask, searchTask } from '../../services/taskService';
import { listAgents } from 'services/userService';
import styled from 'styled-components';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { UnreadMessageIcon } from 'components/UnreadMessageIcon';
import { GlobalContext } from 'contexts/GlobalContext';
import * as ReactDom from 'react-dom';
import * as moment from 'moment';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import PortfolioSelect from 'components/PortfolioSelect';
import ClientSelect from 'components/ClientSelect';

const { Title } = Typography;

const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;

  .ant-table-row.unread {
    font-weight: bold;
    background-color: rgb(255,255,220);
  }

  .ant-table {
    font-size: 12px !important;
  }

  .ant-select-selection-item {
    font-size: 12px !important;
  }
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
`;

const Label = styled.div`
  // width: 100px;
`;

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 50,
  total: 0,
  status: ['todo', 'signed', 'to_sign', 'complete'],
  assignee: null,
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const AdminTaskListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [agentList, setAgentList] = React.useState([]);

  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject('query', DEFAULT_QUERY_INFO, true))
  const context = React.useContext(GlobalContext);
  const myUserId = context.user.id;

  const columnDef = [
    {
      title: 'Task Name',
      dataIndex: 'name',
      // filteredValue: filteredInfo.name || null,
      sorter: () => 0,
      // onFilter: (value, record) => record.name.includes(value),
      render: (text, record) => {
        const { id, name, forWhom, lastUnreadMessageAt } = record;
        return <div>
          <Link to={`/tasks/${id}/proceed?${lastUnreadMessageAt ? 'chat=1' : ''}`}>
            <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={name || ''} />
            {lastUnreadMessageAt && <UnreadMessageIcon style={{ marginLeft: 4 }} />}
          </Link>
          <Space size="small" style={{ alignItems: 'center', width: '100%' }}>
            <PortfolioAvatar value={forWhom} id={record.portfolioId} size={30} />
            <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={forWhom || ''} />
          </Space>
        </div>
      },
      ellipsis: false,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      sorter: () => 0,
      render: (text, record) => <TaskStatus width={40} status={record.status} name={record.forWhom} portfolioId={record.portfolioId} avatar={false}></TaskStatus>,
      ellipsis: false
    },
    {
      title: 'Task Template',
      dataIndex: 'taskTemplateName',
      sorter: () => 0,
      render: (text) => <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text || ''} />,
      ellipsis: false
    },
    // {
    //   title: 'Portfolio',
    //   dataIndex: 'forWhom',
    //   sorter: () => 0,
    //   render: (text, record) => <Space direction="vertical" style={{alignItems: 'center', width: '100%'}}>
    //   <PortfolioAvatar value={text} id={record.portfolioId} size={40}/>
    //   <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text || ''} />
    //   </Space>
    // },
    {
      title: 'User',
      dataIndex: 'email',
      sorter: () => 0,
      render: (text) => <Text><Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text || ''} /></Text>
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      sorter: () => 0,
      render: (text) => <TimeAgo value={text} />
    },
    {
      title: 'Last Update At',
      dataIndex: 'lastUpdatedAt',
      sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text) => {
        return <TimeAgo value={text} />;
      }
    },
    {
      title: 'Last Unread Message',
      dataIndex: 'lastUnreadMessageAt',
      sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (text) => {
        return <TimeAgo value={text} />;
      }
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
      render: (value, record) => value && <TimeAgo value={value} />
    },
    {
      title: 'Assignee',
      dataIndex: 'agentId',
      // filteredValue: filteredInfo.agentId || null,
      // filters: agentList.map(a => ({ text: `${a.givenName} ${a.surname}`, value: a.id })),
      // onFilter: (value, record) => record.agentId === value,
      sorter: () => 0,
      render: (text, record) => <Select
        size="small"
        placeholder="Select an agent"
        style={{ width: 130 }}
        onChange={value => assignTaskToAgent(record, value)}
        value={text}
      >
        <Select.Option key={-1} value={null}>{' '}</Select.Option>
        {agentList.map((a, i) => <Select.Option key={i} value={a.id}>{myUserId === a.id ? 'Me' : `${a.givenName || 'Unset'} ${a.surname || 'Unset'}`}</Select.Option>)}
      </Select>
    },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => (
        <Space size="small">
          <Tooltip placement="bottom" title="Proceed task">
            <Link to={`/tasks/${record.id}/proceed`}><Button type="link" icon={<EditOutlined />}></Button></Link>
          </Tooltip>
          <Tooltip placement="bottom" title="Archive task">
            <Button type="link" danger onClick={e => handleDelete(e, record)} icon={<DeleteOutlined />}></Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const updateQueryInfo = (queryInfo) => {
    reactLocalStorage.setObject('query', queryInfo);
    setQueryInfo(queryInfo);
  }

  const handleTableChange = async (pagination, filters, sorter) => {
    const newQueryInfo = {
      ...queryInfo,
    }
    if (sorter) {
      newQueryInfo.orderField = sorter.field;
      newQueryInfo.orderDirection = sorter.order === 'ascend' ? 'ASC' : 'DESC';
    }

    await loadTaskWithQuery(newQueryInfo);
  }

  const clearAllFilters = () => {
    loadTaskWithQuery({ ...DEFAULT_QUERY_INFO });
  }

  const assignTaskToAgent = async (task, agentId) => {
    await assignTask(task.id, agentId);
    await loadList();
  }

  const loadTaskWithQuery = async (queryInfo) => {
    setLoading(true);
    const { data, pagination: { total } } = await searchTask(queryInfo);

    ReactDom.unstable_batchedUpdates(() => {
      setTaskList(data);
      updateQueryInfo({ ...queryInfo, total })
      setLoading(false);
    });
  }

  const loadList = async () => {
    try {
      setLoading(true);
      await loadTaskWithQuery(queryInfo);
      const agentList = await listAgents();
      ReactDom.unstable_batchedUpdates(() => {
        setAgentList(agentList);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, name } = item;
    Modal.confirm({
      title: <>Archive task <Text strong>{name}</Text>?</>,
      okText: 'Yes, Archive it',
      onOk: async () => {
        await deleteTask(id);
        loadList();
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      }
    });
  }

  const handleSearch = async (value) => {
    const text = value?.trim();

    const newQueryInfo = {
      ...queryInfo,
      page: 1,
      text
    }

    await loadTaskWithQuery(newQueryInfo);
  }

  const handleStatusFilter = async (status) => {
    const newQueryInfo = {
      ...queryInfo,
      page: 1,
      status
    }
    await loadTaskWithQuery(newQueryInfo);
  }

  const handleSearchTextChange = text => {
    const newQueryInfo = {
      ...queryInfo,
      text
    }
    updateQueryInfo(newQueryInfo);
    // await loadTaskWithQuery(newQueryInfo);
  }

  const handleAssigneeChange = (assignee) => {
    const newQueryInfo = {
      ...queryInfo,
      page: 1,
      assignee
    }
    loadTaskWithQuery(newQueryInfo);
  }

  const handleDueDateRangeChange = (dates, dateStrings) => {
    const newQueryInfo = {
      ...queryInfo,
      page: 1,
      dueDateRange: dateStrings && dateStrings[0] && dateStrings[1] ? dateStrings : null
    }
    loadTaskWithQuery(newQueryInfo);
  }

  const handlePaginationChange = async (page, size) => {
    const newQueryInfo = {
      ...queryInfo,
      page,
      size
    }
    await loadTaskWithQuery(newQueryInfo);
  }

  const handleTaskTemplateIdChange = async (taskTemplateId) => {
    const newQueryInfo = {
      ...queryInfo,
      taskTemplateId,
      page: 1,
    }
    await loadTaskWithQuery(newQueryInfo);
  }

  const handlePortfolioIdChange = async (portfolioId) => {
    const newQueryInfo = {
      ...queryInfo,
      portfolioId,
      page: 1,
    }
    await loadTaskWithQuery(newQueryInfo);
  }

  const handleClientIdChange = async (clientId) => {
    const newQueryInfo = {
      ...queryInfo,
      clientId,
      page: 1,
    }
    await loadTaskWithQuery(newQueryInfo);
  }

  const handleCreateTask = () => {
    props.history.push('/tasks/new');
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const StatusSelectOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'To Sign', value: 'to_sign' },
    { label: 'Signed', value: 'signed' },
    { label: 'Complete', value: 'complete' },
    { label: 'Archive', value: 'archive' },
  ]

  return (
    <LayoutStyled>
      
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Task Management</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <Label>Search</Label>
              <Input.Search
                style={{ width: 420 }}
                placeholder="Search text"
                enterButton={<><SearchOutlined /> Search</>}
                onSearch={value => handleSearch(value)}
                onPressEnter={e => handleSearch(e.target.value)}
                onChange={e => handleSearchTextChange(e.target.value)}
                loading={loading}
                value={queryInfo?.text}
                allowClear
              />
            </Space>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button danger ghost onClick={() => clearAllFilters()} icon={<CloseOutlined />}>Reset Filters</Button>
              <Button onClick={() => loadList()} icon={<SyncOutlined />}>Refresh</Button>
              <Button onClick={() => handleCreateTask()} type="primary" icon={<PlusOutlined />}>New Task</Button>
            </Space>
          </Space>
          <Row gutter={[10, 10]}>
            <Col>
              <Space>
                <Label>Status</Label>
                <Select
                  mode="multiple"
                  allowClear={false}
                  style={{ width: 420 }}
                  placeholder="Status filter"
                  value={queryInfo?.status || []}
                  onChange={handleStatusFilter}
                >
                  {StatusSelectOptions.map((x, i) => <Select.Option key={i} value={x.value}>
                    {x.label}
                  </Select.Option>)}
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Label>Due Date</Label>
                <DatePicker.RangePicker
                  value={queryInfo.dueDateRange?.map(x => moment(x, 'DD/MM/YYYY'))} onChange={handleDueDateRangeChange} format="DD/MM/YYYY" />
              </Space>
            </Col>
            <Col>
              <Space>
                <Label>Task Template</Label>
                <TaskTemplateSelect
                  style={{ width: 280 }}

                  value={queryInfo?.taskTemplateId} onChange={handleTaskTemplateIdChange} />
              </Space>
            </Col>
            <Col>
              <Space>
                <Label>Assignee</Label>

                <Select
                  placeholder="Filter assignee"
                  style={{ width: 140 }}
                  onChange={handleAssigneeChange}
                  value={queryInfo?.assignee}
                >
                  <Select.Option key={-1} value={null}>{' '}</Select.Option>
                  {agentList.map((a, i) => <Select.Option key={i} value={a.id}>{myUserId === a.id ? 'Me' : `${a.givenName || 'Unset'} ${a.surname || 'Unset'}`}</Select.Option>)}
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Label style={{ position: 'relative', top: -8 }}>Portfolio</Label>
                <PortfolioSelect
                  style={{ width: 280 }}
                  value={queryInfo?.portfolioId} onChange={handlePortfolioIdChange} />
              </Space>
            </Col>
            <Col>
              <Space>
                <Label style={{ position: 'relative', top: -8 }}>Client</Label>
                <ClientSelect
                  style={{ width: 280 }}
                  value={queryInfo?.clientId} onChange={handleClientIdChange} />
              </Space>
            </Col>
          </Row>



          <Table columns={columnDef}
            dataSource={taskList}
            // scroll={{x: 1000}}
            // style={{marginTop: 30}}
            rowKey="id"
            size="small"
            loading={loading}
            pagination={false}
            onChange={handleTableChange}
            rowClassName={(record) => record.lastUnreadMessageAt ? 'unread' : ''}
            onRow={(record) => ({
              onDoubleClick: () => {
                props.history.push(`/tasks/${record.id}/proceed?${record.lastUnreadMessageAt ? 'chat=1' : ''}`);
              }
            })}
          ></Table>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Pagination size="small" onChange={handlePaginationChange}
              total={queryInfo.total} showSizeChanger={true} pageSize={queryInfo.size} />
          </Space>
        </Space>

      </ContainerStyled>
    </LayoutStyled >
  );
};

AdminTaskListPage.propTypes = {};

AdminTaskListPage.defaultProps = {};

export default AdminTaskListPage;
