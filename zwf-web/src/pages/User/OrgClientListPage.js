import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input } from 'antd';
import Icon, {
  SyncOutlined,
  SearchOutlined,
  ContactsFilled} from '@ant-design/icons';

import { Space } from 'antd';
import { setOrgClientTags$, searchOrgClients$ } from 'services/clientService';
import { TagSelect } from 'components/TagSelect';
import DropdownMenu from 'components/DropdownMenu';
import { TaskStatusTag } from 'components/TaskStatusTag';
import { finalize } from 'rxjs/operators';
import { useLocalstorageState } from 'rooks';
import { InviteClientModal } from 'components/InviteClientModal';
import { TimeAgo } from 'components/TimeAgo';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';
import { useCreateTaskModal } from 'hooks/useCreateTaskModal';
import { MdDashboardCustomize } from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa';
import { ClientNameCard } from 'components/ClientNameCard';
import { BsDatabaseFill, BsFillPersonVcardFill, BsFillSendFill } from 'react-icons/bs';
import { ClientDatabagDrawer } from 'pages/OrgBoard/ClientDatabagDrawer';
import { ClientInfoDrawer } from 'pages/OrgBoard/ClientInfoDrawer';
import { HiDatabase, HiVariable } from 'react-icons/hi';


const { Text, Link: TextLink } = Typography;

const ContainerStyled = styled.div`
`;

const DEFAULT_QUERY_INFO = {
  text: '',
  tags: [],
  page: 1,
  size: 50,
  orderField: 'createdAt',
  orderDirection: 'DESC'
};

const LOCAL_STORAGE_KEY = 'user_query';

const OrgClientListPage = () => {
  useAssertRole(['admin', 'agent'])
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [inviteUserModalVisible, setInviteUserModalVisible] = React.useState(false);
  const [currentClient, setCurrentClient] = React.useState();
  const [list, setList] = React.useState([]);
  const [queryInfo, setQueryInfo] = useLocalstorageState(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO)
  const [openTaskCreator, taskCreatorContextHolder] = useCreateTaskModal();
  const [openInfo, setOpenInfo] = React.useState(false);
  const [openDatabag, setOpenDatabag] = React.useState(false);


  const handleTagChange = (orgClient, tags) => {
    setOrgClientTags$(orgClient.id, tags).subscribe()
  }

  const loadList$ = () => {
    return searchByQueryInfo$(queryInfo)
  }

  React.useEffect(() => {
    const sub = loadList$();
    return () => sub.unsubscribe();
  }, []);

  const handleSearchTextChange = text => {
    setQueryInfo(queryInfo => ({
      ...queryInfo,
      text
    }));
  }

  const handleSearch = (value) => {
    const text = value?.trim();

    const newQueryInfo = {
      ...queryInfo,
      text
    }

    searchByQueryInfo$(newQueryInfo);
  }

  const searchByQueryInfo$ = (queryInfo) => {
    setLoading(true);
    return searchOrgClients$(queryInfo).pipe(
      finalize(() => setLoading(false))
    ).subscribe(resp => {
      const { count, page, data } = resp;
      setTotal(count);
      setList(data);
      setQueryInfo({ ...queryInfo, page });
    })

  }

  const createTaskForClient = (user) => {
    openTaskCreator({
      client: user,
    });
  }

  const handleTagFilterChange = (tags) => {
    searchByQueryInfo$({ ...queryInfo, page: 1, tags });
  }


  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo$({ ...queryInfo, page, size: pageSize });
  }

  const handleGoToTasks = (item, status) => {

  }


  const columnDef = [
    {
      title: <Input.Search
        placeholder="Search name or email"
        enterButton={<SearchOutlined />}
        onSearch={value => handleSearch(value)}
        onPressEnter={e => handleSearch(e.target.value)}
        onChange={e => handleSearchTextChange(e.target.value)}
        loading={loading}
        value={queryInfo?.text}
        allowClear
      />,
      // width: 400,
      fixed: 'left',
      render: (text, item) => <Space>
        <ClientNameCard id={item.id} allowChangeAlias={true} />
      </Space>
    },
    {
      title: <span style={{ fontWeight: 400 }}><TagSelect value={queryInfo.tags} onChange={handleTagFilterChange} allowClear={true} /></span>,
      dataIndex: 'tags',
      render: (value, item) => <TagSelect value={value} onChange={tags => handleTagChange(item, tags)} bordered={false} inPlaceEdit={true} placeholder="Click to select tags" />
    },
    {
      title: "Invited",
      dataIndex: 'invitedAt',
      align: 'center',
      width: 110,
      render: (value) => <TimeAgo value={value} showTime={false} accurate={false} />
    },
    {
      title: <TaskStatusTag status="todo" />,
      dataIndex: 'countToDo',
      width: 40,
      align: 'right',
      render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'todo')}>{value}</TextLink> : null,
    },
    {
      title: <TaskStatusTag status="in_progress" />,
      dataIndex: 'countInProgress',
      width: 40,
      align: 'right',
      render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'in_progress')}>{value}</TextLink> : null,
    },
    {
      title: <TaskStatusTag status="action_required" />,
      dataIndex: 'countActionRequired',
      width: 40,
      align: 'right',
      render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'action_required')}>{value}</TextLink> : null,
    },
    {
      title: <TaskStatusTag status="done" />,
      dataIndex: 'countDone',
      width: 40,
      align: 'right',
      render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'done')}>{value}</TextLink> : null,
    },
    // {
    //   title: <TaskStatusTag status="archived" />,
    //   dataIndex: 'countArchived',
    //   width: 40,
    //   align: 'right',
    //   render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'archived')}>{value}</TextLink> : null,
    // },
    {
      width: 40,
      align: 'right',
      fixed: 'right',
      render: (text, item) => {
        return <div>
          <DropdownMenu
            config={[
              {
                icon: <Icon component={MdDashboardCustomize} />,
                menu: `New task for this client`,
                onClick: () => createTaskForClient(item)
              },
              item.userId ? {
                icon: <ContactsFilled />,
                menu: `Client information`,
                onClick: () => {
                  setCurrentClient(item)
                  setOpenInfo(true);
                }
              } : {
                icon: <Icon component={BsFillSendFill} />,
                menu: `Invite client to ZeeWorkflow`,
                onClick: () => {
                  setCurrentClient(item)
                  setOpenInfo(true);
                }
              },
              {
                icon: <Icon component={HiDatabase} />,
                menu: `Profile`,
                onClick: () => {
                  setCurrentClient(item)
                  setOpenDatabag(true);
                }
              },
              // {
              //   menu: `Tasks of client`,
              //   onClick: () => { }
              // },
              // {
              //   icon: <TagsOutlined />,
              //   menu: 'Tags',
              //   onClick: () => handleTagsChange(user)
              // },
            ]}
          />
        </div>
      }
    },
  ].filter(x => !!x);

  return (
    <ContainerStyled>
      <PageHeaderContainer
        breadcrumb={[
          {
            name: 'Users'
          },
          {
            name: 'Clients',
          },
        ]}
        loading={loading}
        title='Clients'
        extra={[
          <Button key="refresh" icon={<SyncOutlined />} onClick={() => loadList$()}></Button>,
          <Button key="invite" ghost icon={<Icon component={FaUserPlus} />} type="primary" onClick={() => setInviteUserModalVisible(true)}>Add New Client</Button>
        ]}
      >
        <Table columns={columnDef}
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          rowKey="id"
          style={{ marginTop: 20 }}
          locale={{
            emptyText: <div style={{ display: 'flex', flexDirection: 'column', margin: '2rem auto' }}>
              No clients.
              <Button type="link" onClick={() => setInviteUserModalVisible(true)}>Add new client</Button>
            </div>
          }}
          pagination={{
            current: queryInfo.current,
            pageSize: queryInfo.size,
            total: total,
            showTotal: total => `Total ${total}`,
            pageSizeOptions: [10, 30, 60],
            showSizeChanger: true,
            showQuickJumper: true,
            disabled: loading,
            onChange: handlePaginationChange,
            onShowSizeChange: (page, size) => {
              searchByQueryInfo$({ ...queryInfo, page, size });
            }
          }}
        />
      </PageHeaderContainer>
      <ClientInfoDrawer id={currentClient?.id} open={openInfo} onClose={() => setOpenInfo(false)} />
      <ClientDatabagDrawer id={currentClient?.id} open={openDatabag} onClose={() => setOpenDatabag(false)} />
      <InviteClientModal open={inviteUserModalVisible}
        onOk={() => {
          setInviteUserModalVisible(false);
          loadList$();
        }}
        onCancel={() => setInviteUserModalVisible(false)} />
      {taskCreatorContextHolder}
    </ContainerStyled>

  );
};

OrgClientListPage.propTypes = {};

OrgClientListPage.defaultProps = {};

export default OrgClientListPage;
