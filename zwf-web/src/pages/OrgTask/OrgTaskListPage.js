import { DeleteOutlined, EditOutlined, SearchOutlined, SyncOutlined, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { Button, Input, Card, Modal, Select, Space, Row, Table, Tooltip, Typography, Tag, Pagination, Col } from 'antd';
import Text from 'antd/lib/typography/Text';

import { TaskStatus } from 'components/TaskStatus';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import Highlighter from "react-highlight-words";
import { Link } from 'react-router-dom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { assignTask, changeTaskStatus$, deleteTask$, searchTask$ } from '../../services/taskService';
import styled from 'styled-components';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import { UnreadMessageIcon } from 'components/UnreadMessageIcon';
import { GlobalContext } from 'contexts/GlobalContext';
import * as ReactDom from 'react-dom';
import * as moment from 'moment';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import ClientSelect from 'components/ClientSelect';
import { AssigneeSelect } from 'components/AssigneeSelect';
import { TaskStatusButton } from 'components/TaskStatusButton';
import DropdownMenu from 'components/DropdownMenu';
import { UserDisplayName } from 'components/UserDisplayName';
import { UserAvatar } from 'components/UserAvatar';
import { notify } from 'util/notify';
import { showCreateTaskModal } from 'components/showCreateTaskModal';
import { TaskTagSelect } from 'components/TaskTagSelect';

const { Title } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
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
  status: ['todo', 'in_progress', 'pending_fix', 'signed', 'pending_sign', 'done'],
  assignee: null,
  orderField: 'lastUpdatedAt',
  orderDirection: 'DESC'
};

const OrgTaskListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [taskList, setTaskList] = React.useState([]);
  const [agentList, setAgentList] = React.useState([]);

  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject('query', DEFAULT_QUERY_INFO, true))
  const context = React.useContext(GlobalContext);
  const myUserId = context.user.id;

  React.useEffect(() => {
    const subscription = loadList$();
    return () => {
      subscription.unsubscribe();
    }
  }, []);

  const loadAgentList$ = () => {

  }

  const postArchieveMessage = () => {
    notify.info('Task was archieved', <>You can find all the archived tasks by fitler status <Tag>Archived</Tag></>)
  }

  const handleTaskStatusChange = (taskId, newStatus) => {
    changeTaskStatus$(taskId, newStatus)
    .subscribe(() => {
      loadList$();
      if(newStatus === 'archived' && !queryInfo.status.includes('archived')) {
        postArchieveMessage();
      }
    })
  }
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
          <Link to={`/task/${id}?${lastUnreadMessageAt ? 'chat=1' : ''}`}>
            <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={name || ''} />
            {lastUnreadMessageAt && <UnreadMessageIcon style={{ marginLeft: 4 }} />}
          </Link>
          <Space size="small" style={{ alignItems: 'center', width: '100%' }}>
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
      render: (value, record) => <small>
      <TaskStatusButton size="small" value={value} onChange={(newStatus) => handleTaskStatusChange(record.id, newStatus)}/>
      </small>,
      ellipsis: false
    },
    {
      title: 'Task Template',
      dataIndex: 'taskTemplateName',
      sorter: () => 0,
      render: (text) => <Highlighter highlightClassName="search-highlighting" searchWords={[queryInfo.text]} autoEscape={true} textToHighlight={text || ''} />,
      ellipsis: false
    },
    {
      title: 'User',
      dataIndex: 'email',
      sorter: () => 0,
      render: (text, item) => <Space direction='horizontal'>
        <UserAvatar userId={item.userId} size={40}/>
        <UserDisplayName 
      email={item.email} 
      surname={item.surname}
      givenName={item.givenName}
      searchText={queryInfo.text}
      />
      </Space>
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      render: (tags, item) => <TaskTagSelect readonly={true} value={tags.map(t => t.id)}/>
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
    // {
    //   title: 'Due Date',
    //   dataIndex: 'dueDate',
    //   sorter: () => 0, // Server end sorting. moment(a.createdAt).toDate() - moment(b.createdAt).toDate(),
    //   render: (value) => value && <TimeAgo value={value} />
    // },
    {
      title: 'Assignee',
      dataIndex: 'agentId',
      // filteredValue: filteredInfo.agentId || null,
      // filters: agentList.map(a => ({ text: `${a.givenName} ${a.surname}`, value: a.id })),
      // onFilter: (value, record) => record.agentId === value,
      sorter: () => 0,
      // render: (text, record) => <Select
      //   size="small"
      //   placeholder="Select an agent"
      //   style={{ width: 130 }}
      //   onChange={value => assignTaskToAgent(record, value)}
      //   value={text}
      // >
      //   <Select.Option key={-1} value={null}>{' '}</Select.Option>
      //   {agentList.map((a, i) => <Select.Option key={i} value={a.id}>{myUserId === a.id ? 'Me' : `${a.givenName || 'Unset'} ${a.surname || 'Unset'}`}</Select.Option>)}
      // </Select>,
      render: (text, record) => <AssigneeSelect
        options={agentList}
        onChange={agentId => assignTaskToAgent(record, agentId)}
        value={text}
      />
    },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => (
        <DropdownMenu 
          config={[
            {
              icon: <EditOutlined />,
              menu: 'Edit',
              onClick: () => props.history.push(`/tasks/${record.id}`)
            },
            {
              icon: <Text type="danger"><DeleteOutlined /></Text>,
              menu: <Text type="danger">Archive</Text>,
              onClick: () => handleDelete(record)
            }
          ]}
        />
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

    await loadTaskWithQuery$(newQueryInfo);
  }

  const clearAllFilters = () => {
    loadTaskWithQuery$({ ...DEFAULT_QUERY_INFO });
  }

  const assignTaskToAgent = async (task, agentId) => {
    await assignTask(task.id, agentId);
    await loadList$();
  }

  const loadTaskWithQuery$ = (queryInfo) => {
    setLoading(true);
    return searchTask$(queryInfo).subscribe(resp => {
      const { data, pagination: { total } } = resp;
      setTaskList(data);
      updateQueryInfo({ ...queryInfo, total })
      setLoading(false);
    })
  }

  const loadList$ = () => {
    return loadTaskWithQuery$(queryInfo);
  }

  const handleDelete = async (item) => {
    const { id, name } = item;
    Modal.confirm({
      title: <>Archive task <Text strong>{name}</Text>?</>,
      okText: 'Yes, Archive it',
      onOk: () => {
        postArchieveMessage();
        deleteTask$(id).subscribe(() => loadList$());
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

    await loadTaskWithQuery$(newQueryInfo);
  }

  const handleStatusFilter = async (status) => {
    const newQueryInfo = {
      ...queryInfo,
      page: 1,
      status
    }
    await loadTaskWithQuery$(newQueryInfo);
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
    loadTaskWithQuery$(newQueryInfo);
  }

  const handlePaginationChange = async (page, size) => {
    const newQueryInfo = {
      ...queryInfo,
      page,
      size
    }
    await loadTaskWithQuery$(newQueryInfo);
  }

  const handleTaskTemplateIdChange = async (taskTemplateId) => {
    const newQueryInfo = {
      ...queryInfo,
      taskTemplateId,
      page: 1,
    }
    await loadTaskWithQuery$(newQueryInfo);
  }

  const handleClientIdChange = async (client) => {
    const newQueryInfo = {
      ...queryInfo,
      clientId: client?.id,
      page: 1,
    }
    await loadTaskWithQuery$(newQueryInfo);
  }

  const StatusSelectOptions = [
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Pending Fix', value: 'pending_fix' },
    { label: 'Pending Sign', value: 'pending_sign' },
    { label: 'Signed', value: 'signed' },
    { label: 'Done', value: 'done' },
    { label: 'Archived', value: 'archived' },
  ]

  return (
    <LayoutStyled>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
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
              <Button onClick={() => loadList$()} icon={<SyncOutlined />}>Refresh</Button>
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
            {/* <Col>
              <Space>
                <Label>Due Date</Label>
                <DatePicker.RangePicker
                  value={queryInfo.dueDateRange?.map(x => moment(x, 'DD/MM/YYYY'))} onChange={handleDueDateRangeChange} format="DD/MM/YYYY" />
              </Space>
            </Col> */}
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
                <AssigneeSelect
                  placeholder="Filter assignee"
                  onChange={handleAssigneeChange}
                />
              </Space>
            </Col>
            <Col>
              <Space>
                <Label style={{ position: 'relative', top: -8 }}>Client</Label>
                <ClientSelect
                  valueProp="id"
                  style={{ width: 280 }}
                  value={queryInfo?.clientId} 
                  onChange={handleClientIdChange} />
              </Space>
            </Col>
          </Row>
        </Card>

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
              props.history.push(`/task/${record.id}?${record.lastUnreadMessageAt ? 'chat=1' : ''}`);
            }
          })}
        ></Table>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Pagination size="small" onChange={handlePaginationChange}
            total={queryInfo.total} showSizeChanger={true} pageSize={queryInfo.size} />
        </Space>
      </Space>

    </LayoutStyled >
  );
};

OrgTaskListPage.propTypes = {};

OrgTaskListPage.defaultProps = {};

export default OrgTaskListPage;
