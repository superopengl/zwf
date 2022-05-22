import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Form, Drawer, PageHeader, Descriptions, List } from 'antd';
import {
  SyncOutlined, QuestionOutlined,
  SearchOutlined,
  ClearOutlined,
  PlusOutlined,
  TagOutlined,
  TagsOutlined,
  UserAddOutlined,
  PhoneOutlined
} from '@ant-design/icons';

import { Space } from 'antd';
import { deleteUser, setPasswordForUser, setUserTags, setUserTags$, searchOrgClientUsers$ } from 'services/userService';
import { impersonate$ } from 'services/authService';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import { TagSelect } from 'components/TagSelect';
import ReactDOM from 'react-dom';
import TagFilter from 'components/TagFilter';
import DropdownMenu from 'components/DropdownMenu';
import { UserNameCard } from 'components/UserNameCard';
import { TaskStatusTag } from 'components/TaskStatusTag';
import { showSetTagsModal } from 'components/showSetTagsModal';
import { finalize } from 'rxjs/operators';
import { useLocalstorageState } from 'rooks';
import { InviteClientModal } from 'components/InviteClientModal';
import { TimeAgo } from 'components/TimeAgo';
import { UserAvatar } from 'components/UserAvatar';
import { CreateTaskModal } from 'components/CreateTaskModal';


const { Text } = Typography;

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

  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [createTaskModalVisible, setCreateTaskModalVisible] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState();
  const [inviteUserModalVisible, setInviteUserModalVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [queryInfo, setQueryInfo] = useLocalstorageState(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO)

  const handleTagChange = (user, tags) => {
    setUserTags$(user.id, tags).subscribe()
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
    return searchOrgClientUsers$(queryInfo).pipe(
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
    setCreateTaskModalVisible(true);
    setCurrentUser(user);
  }

  const handleTagFilterChange = (tags) => {
    searchByQueryInfo$({ ...queryInfo, page: 1, tags });
  }


  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo$({ ...queryInfo, page, size: pageSize });
  }

  const handleTagsChange = user => {
    showSetTagsModal(user.tags, (tagIds, onClose) => {
      setUserTags$(user.id, tagIds).pipe(
        finalize(() => onClose())
      ).subscribe(() => {
        loadList$();
      });
    })
  }

  const handleInviteClient = () => {

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
      render: (text, item) => <UserNameCard userId={item.id} />,
    },
    {
      title: <TagSelect value={queryInfo.tags} onChange={handleTagFilterChange} allowCreate={false} />,
      dataIndex: 'tags',
      render: (value, item) => <TagSelect value={value} onChange={tags => handleTagChange(item, tags)} inPlaceEdit={true} />
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
      width: 70,
      align: 'right',
      fixed: 'right',
      render: (text, user) => {
        return (
          <DropdownMenu
            config={[
              {
                icon: <PlusOutlined />,
                menu: `Create task for this client`,
                onClick: () => createTaskForUser(user)
              },
              {
                icon: <PhoneOutlined />,
                menu: `Client contact`,
                onClick: () => openClientContact(user)
              },
              {
                menu: `Tasks of client`,
                onClick: () => { }
              },
              // {
              //   icon: <TagsOutlined />,
              //   menu: 'Tags',
              //   onClick: () => handleTagsChange(user)
              // },
            ]}
          />
        )
      },
    },
  ].filter(x => !!x);

  return (
    <ContainerStyled>
      <PageHeader
        backIcon={false}
        title={"Clients"}
        extra={[
          <Button key="refresh" icon={<SyncOutlined />} onClick={() => loadList$()}>Refresh</Button>,
          <Button key="invite" icon={<UserAddOutlined />} type="primary" onClick={() => setInviteUserModalVisible(true)}>Invite Client</Button>
        ]}
      >
        <Table columns={columnDef}
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          rowKey="id"
          loading={loading}
          style={{ marginTop: 20 }}
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
      </PageHeader>
      <Drawer
        visible={profileModalVisible}
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
      <InviteClientModal visible={inviteUserModalVisible}
        onOk={() => {
          setInviteUserModalVisible(false);
          loadList$();
        }}
        onCancel={() => setInviteUserModalVisible(false)} />
      <CreateTaskModal
        client={currentUser}
        visible={createTaskModalVisible}
        onCancel={() => setCreateTaskModalVisible(false)}
        onOk={() => setCreateTaskModalVisible(false)}
      />
    </ContainerStyled>

  );
};

OrgClientListPage.propTypes = {};

OrgClientListPage.defaultProps = {};

export default OrgClientListPage;
