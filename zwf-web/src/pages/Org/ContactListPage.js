import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Tag, Drawer } from 'antd';
import {
  SyncOutlined, QuestionOutlined,
  SearchOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';
import { deleteUser, setUserTags } from 'services/userService';
import { impersonate$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import { HighlightingText } from 'components/HighlightingText';
import ReactDOM from 'react-dom';
import TagFilter from 'components/TagFilter';
import { listOrgs$ } from 'services/orgService';
import DropdownMenu from 'components/DropdownMenu';
import PromotionListPanel from 'pages/Promotion/PromotionListPanel';
import { listMyContact$, listUserContact$, subscribeContactChange, sendContact$ } from 'services/contactService';
import { finalize } from 'rxjs/operators';
import { UserDisplayName } from 'components/UserDisplayName';
import { ContactMessageList } from 'components/ContactMessageList';
import { AdminReplyContactDrawer } from 'components/AdminReplyContactDrawer';
import { Subject } from 'rxjs';
import { getUserDisplayName } from 'util/getUserDisplayName';
import { UserNameCard } from 'components/UserNameCard';
import Icon, { BorderOutlined, FileOutlined, FilePdfFilled, FilePdfOutlined, UserOutlined } from '@ant-design/icons';
import { MdMessage } from 'react-icons/md';


const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
.pending-reply {
  .ant-table-cell {
    background-color: #cf222e22;
    font-weight: 700;
  }
}
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

const ContactListPage = () => {

  const [chatVisible, setChatVisible] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const context = React.useContext(GlobalContext);
  const eventSource$ = React.useRef(new Subject());
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))

  const columnDef = [
    {
      title: 'User',
      fixed: 'left',
      render: (_, item) => <Space>
        <UserNameCard userId={item.userId} />
        {!item.replied && <Button type="text" danger icon={<Icon component={() => <MdMessage />} />} onClick={() =>  handleChatWith(item)}/>}
      </Space>
    },
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   render: (value, item) => <Text code>{value}</Text>,
    // },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role, item) => <>{role} {item.orgOwner && <Tag color="red">Owner</Tag>}</>
    },
    {
      title: 'Org',
      dataIndex: 'orgName',
      render: (value) => value
    },
    {
      title: 'Last Contact At',
      dataIndex: 'lastMessageAt',
      render: (value, item) => <TimeAgo value={value} />
    },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      align: 'right',
      fixed: 'right',
      render: (text, item) => {
        return (
          <DropdownMenu
            config={[
              {
                menu: 'Chat',
                onClick: () => handleChatWith(item)
              },
              {
                menu: 'Impersonate',
                onClick: () => handleImpersonante(item)
              }
            ]}
          />
        )
      },
    },
  ].filter(x => !!x);

  const loadList = () => {
    setLoading(true);

    return listMyContact$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(
      list => setList(list)
    );
  }

  React.useEffect(() => {
    const load$ = loadList();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  // Subscribe message events
  React.useEffect(() => {
    const es = subscribeContactChange();
    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      eventSource$.current.next(event);
      setList(list => {
        const item = list.find(x => x.userId === event.userId);
        if (item) {
          const beforeValue = item.replied;
          item.replied = event.by !== event.userId;
          if(beforeValue !== item.replied) {
            return [...list];
          }
        }
        return list;
      })
    }

    return () => {
      es?.close()
    }
  }, []);

  const updateQueryInfo = (queryInfo) => {
    reactLocalStorage.setObject(LOCAL_STORAGE_KEY, queryInfo);
    setQueryInfo(queryInfo);
  }

  const handleSearchTextChange = text => {
    const newQueryInfo = {
      ...queryInfo,
      text
    }
    updateQueryInfo(newQueryInfo);
    // await loadTaskWithQuery(newQueryInfo);
  }

  const handleSearch = async (value) => {
    const text = value?.trim();

    const newQueryInfo = {
      ...queryInfo,
      text
    }

    await loadList(newQueryInfo);
  }

  const searchByQueryInfo = async (queryInfo) => {
    // try {
    //   setLoading(true);
    //   const resp = await searchOrgMemberUsers(queryInfo);
    //   const { count, page, data } = resp;
    //   ReactDOM.unstable_batchedUpdates(() => {
    //     setTotal(count);
    //     setList(data);
    //     setQueryInfo({ ...queryInfo, page });
    //     setLoading(false);
    //   });
    //   reactLocalStorage.setObject(LOCAL_STORAGE_KEY, queryInfo);
    // } catch {
    //   setLoading(false);
    // }
  }

  const handleImpersonante = async (user) => {
    Modal.confirm({
      title: 'Impersonate',
      icon: <QuestionOutlined />,
      content: <>To impersonate user <Text code>{user.email}</Text>?</>,
      okText: 'Yes, impersonate',
      maskClosable: true,
      onOk: () => {
        impersonate$(user.email)
          .subscribe(() => {
            reactLocalStorage.clear();
            window.location = '/';
          });
      }
    })
  }

  const handleChatWith = (user) => {
    setCurrentUser(user);
    setChatVisible(true);
  }

  const handleOpenPromotionCode = (user) => {
    setCurrentUser(user);
    setChatVisible(true);
  }

  const handleTagFilterChange = (tags) => {
    searchByQueryInfo({ ...queryInfo, page: 1, tags });
  }

  const handleClearFilter = () => {
    searchByQueryInfo(DEFAULT_QUERY_INFO);
  }

  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo({ ...queryInfo, page, size: pageSize });
  }

  const handleSubmitMessage = (message) => {
    return sendContact$(message, null, currentUser.userId);
  }

  return (
    <ContainerStyled>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Search name or email"
            enterButton={<SearchOutlined />}
            onSearch={value => handleSearch(value)}
            onPressEnter={e => handleSearch(e.target.value)}
            onChange={e => handleSearchTextChange(e.target.value)}
            loading={loading}
            value={queryInfo?.text}
            allowClear
          />
          <Space>
            <Button danger ghost onClick={() => handleClearFilter()} icon={<ClearOutlined />}>Clear Filter</Button>
            <Button type="primary" ghost onClick={() => loadList()} icon={<SyncOutlined />}></Button>
          </Space>
        </Space>
        {tags && <TagFilter value={queryInfo.tags} onChange={handleTagFilterChange} tags={tags} />}
        <Table columns={columnDef}
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          rowKey="userId"
          loading={loading}
          style={{ marginTop: 20 }}
          rowClassName={item => {
            return item.replied ? null : 'pending-reply'
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
              searchByQueryInfo({ ...queryInfo, page, size });
            }
          }}
        />
      </Space>
      <AdminReplyContactDrawer
        title={currentUser ? <UserNameCard userId={currentUser.userId} /> : null}
        userId={currentUser?.userId}
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        eventSource={eventSource$.current}
      />
    </ContainerStyled>

  );
};

ContactListPage.propTypes = {};

ContactListPage.defaultProps = {};

export default withRouter(ContactListPage);
