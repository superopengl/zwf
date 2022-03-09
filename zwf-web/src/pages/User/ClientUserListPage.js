import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Form, Drawer, PageHeader } from 'antd';
import {
  SyncOutlined, QuestionOutlined,
  SearchOutlined,
  ClearOutlined,
  PlusOutlined,
  TagOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';
import { searchOrgClientUsers, deleteUser, setPasswordForUser, setUserTags } from 'services/userService';
import { impersonate$ } from 'services/authService';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import { TagSelect } from 'components/TagSelect';
import ReactDOM from 'react-dom';
import TagFilter from 'components/TagFilter';
import DropdownMenu from 'components/DropdownMenu';
import { UserNameCard } from 'components/UserNameCard';
import { TaskStatusTag } from 'components/TaskStatusTag';


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

const ClientUserListPage = () => {

  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))

  const handleTagChange = async (user, tags) => {
    await setUserTags(user.id, tags);
  }



  const loadList = async () => {
    try {
      setLoading(true);
      await searchByQueryInfo(queryInfo)
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleSearchTextChange = text => {
    setQueryInfo(queryInfo => ({
      ...queryInfo,
      text
    }));
  }

  const handleSearch = async (value) => {
    const text = value?.trim();

    const newQueryInfo = {
      ...queryInfo,
      text
    }

    await searchByQueryInfo(newQueryInfo);
  }

  const searchByQueryInfo = async (queryInfo) => {
    try {
      setLoading(true);
      const resp = await searchOrgClientUsers(queryInfo);
      const { count, page, data } = resp;
      ReactDOM.unstable_batchedUpdates(() => {
        setTotal(count);
        setList(data);
        setQueryInfo({ ...queryInfo, page });
        setLoading(false);
      });
      reactLocalStorage.setObject(LOCAL_STORAGE_KEY, queryInfo);
    } catch {
      setLoading(false);
    }
  }




  const openProfileModal = async (user) => {
    setProfileModalVisible(true);
    setCurrentUser(user);
  }


  const handleTagFilterChange = (tags) => {
    searchByQueryInfo({ ...queryInfo, page: 1, tags });
  }


  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo({ ...queryInfo, page, size: pageSize });
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
      fixed: 'left',
      render: (text, item) => <UserNameCard userId={item.id} />,
    },
    // {
    //   title: 'Login Type',
    //   dataIndex: 'loginType',
    //   render: (text) => text === 'local' ? <Tag color="#333333">Local</Tag> : <Tag icon={<GoogleOutlined />} color="#4c8bf5">Google</Tag>
    // },
    {
      title: <TagSelect value={queryInfo.tags} onChange={handleTagFilterChange} allowCreate={false} />,
      dataIndex: 'tags',
      render: (value, item) => <TagSelect value={value} onChange={tags => handleTagChange(item, tags)} readonly={true} />
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
                onClick: () => openProfileModal(user)
              },
              {
                menu: `Tasks of client`,
                onClick: () => openProfileModal(user)
              },
              {
                icon: <TagsOutlined />,
                menu: 'Tags',
                onClick: () => openProfileModal(user)
              },
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
      >
        <Table columns={columnDef}
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          // scroll={{x: 1000}}
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
              searchByQueryInfo({ ...queryInfo, page, size });
            }
          }}
        />
      </PageHeader>
      <Drawer
        visible={profileModalVisible}
        destroyOnClose={true}
        maskClosable={true}
        title="Update Profile"
        onClose={() => setProfileModalVisible(false)}
        footer={null}
        width={400}
      // bodyStyle={{width: "80vw", maxWidth: 600}}
      >
        {/* <Alert style={{ marginBottom: '0.5rem' }} type="warning" showIcon message="Changing email will change the login account. After changing, system will send out a new invitation to the new email address to reset your password." /> */}

        {currentUser && <ProfileForm user={currentUser} onOk={() => setProfileModalVisible(false)} refreshAfterLocaleChange={false} />}
      </Drawer>
    </ContainerStyled>

  );
};

ClientUserListPage.propTypes = {};

ClientUserListPage.defaultProps = {};

export default withRouter(ClientUserListPage);
