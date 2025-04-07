import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Drawer, Descriptions } from 'antd';
import Icon, {
  SyncOutlined,
  SearchOutlined,
  PlusOutlined,
  UserAddOutlined,
  PhoneOutlined
} from '@ant-design/icons';

import { Space } from 'antd';
import { setOrgClientTags$, searchOrgClients$, saveClientAlias$ } from 'services/clientService';
import { TagSelect } from 'components/TagSelect';
import DropdownMenu from 'components/DropdownMenu';
import { UserNameCard } from 'components/UserNameCard';
import { TaskStatusTag } from 'components/TaskStatusTag';
import { showSetTagsModal } from 'components/showSetTagsModal';
import { finalize } from 'rxjs/operators';
import { useLocalstorageState } from 'rooks';
import { InviteClientModal } from 'components/InviteClientModal';
import { TimeAgo } from 'components/TimeAgo';
import { UserAvatar } from 'components/UserAvatar';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';
import { useCreateTaskModal } from 'hooks/useCreateTaskModal';
import { MdDashboardCustomize } from 'react-icons/md';
import { FaUserPlus } from 'react-icons/fa';
import { ClientNameCard } from 'components/ClientNameCard';
import { BsFillPersonVcardFill } from 'react-icons/bs';


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
  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [createTaskModalVisible, setCreateTaskModalVisible] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState();
  const [inviteUserModalVisible, setInviteUserModalVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [queryInfo, setQueryInfo] = useLocalstorageState(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO)
  const [openTaskCreator, taskCreatorContextHolder] = useCreateTaskModal();

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

  const openClientContact = (user) => {
    setProfileModalVisible(true);
    setCurrentUser(user);
  }

  const createTaskForUser = (user) => {
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

  const handleAliasChange = (item, newAlias) => {
    const formattedAlias = newAlias.trim();
    if (item.clientAlias !== formattedAlias) {
      saveClientAlias$(item.id, formattedAlias).subscribe();
    }
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
        <ClientNameCard id={item.id} onAliasChange={(newAlias) => handleAliasChange(item, newAlias)} />
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
      render: (value) => value
    },
    {
      title: <TaskStatusTag status="in_progress" />,
      dataIndex: 'countInProgress',
      width: 40,
      align: 'right',
      render: (value) => value
    },
    {
      title: <TaskStatusTag status="action_required" />,
      dataIndex: 'countActionRequired',
      width: 40,
      align: 'right',
      render: (value) => value
    },
    {
      title: <TaskStatusTag status="done" />,
      dataIndex: 'countDone',
      width: 40,
      align: 'right',
      render: (value) => value
    },
    {
      title: <TaskStatusTag status="archived" />,
      dataIndex: 'countArchived',
      width: 40,
      align: 'right',
      render: (value) => value
    },
    {
      width: 140,
      align: 'right',
      fixed: 'right',
      render: (text, user) => {
        return <div>
          <Button icon={<Icon component={BsFillPersonVcardFill} />} type="text"></Button>
          <DropdownMenu
            config={[
              {
                icon: <Icon component={MdDashboardCustomize} />,
                menu: `New task for this client`,
                onClick: () => createTaskForUser(user)
              },
              {
                icon: <PhoneOutlined />,
                menu: `Client contact`,
                onClick: () => openClientContact(user)
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
      <Drawer
        open={profileModalVisible}
        destroyOnClose={true}
        maskClosable={true}
        title="Client Contact"
        onClose={() => setProfileModalVisible(false)}
        footer={null}
        width={400}
      // bodyStyle={{width: "80vw", maxWidth: 600}}
      >
        {/* <Alert style={{ marginBottom: '0.5rem' }} type="warning" showIcon message="Changing email will change the login account. After changing, system will send out a new invitation to the new email address to reset your password." /> */}

        {currentUser && <Space style={{ width: '100%', alignItems: 'center' }} direction="vertical" size="large">
          <UserAvatar size={120} editable={false} userId={currentUser.id} givenName={currentUser.givenName} surname={currentUser.surname} />
          <Descriptions column={1} bordered={true}>
            <Descriptions.Item label="Email">{currentUser.email}</Descriptions.Item>
            <Descriptions.Item label="Given Name">{currentUser.givenName}</Descriptions.Item>
            <Descriptions.Item label="Surname">{currentUser.surname}</Descriptions.Item>
            <Descriptions.Item label="Phone">{currentUser.phone}</Descriptions.Item>
          </Descriptions>
        </Space>}
      </Drawer>
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
