import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Tag, Drawer, Badge } from 'antd';
import {
  SyncOutlined, QuestionOutlined,
  SearchOutlined,
  ClearOutlined,
  CheckCircleFilled,
  CheckOutlined
} from '@ant-design/icons';

import { Space } from 'antd';
import { deleteUser, setUserTags } from 'services/userService';
import { impersonate$, reinviteMember$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import { HighlightingText } from 'components/HighlightingText';
import TagFilter from 'components/TagFilter';
import { listOrgs$ } from 'services/orgService';
import DropdownMenu from 'components/DropdownMenu';
import PromotionListPanel from 'pages/Promotion/PromotionListPanel';
import { getMySupport$, getUserSupport$, subscribeSupportMessage, sendContact$, searchUserSupports$ } from 'services/supportService';
import { finalize } from 'rxjs/operators';
import { UserDisplayName } from 'components/UserDisplayName';
import { SupportMessageList } from 'components/SupportMessageList';
import { SupportReplyDrawer } from 'components/SupportReplyDrawer';
import { Subject } from 'rxjs';
import { getUserDisplayName } from 'util/getUserDisplayName';
import { UserNameCard } from 'components/UserNameCard';
import Icon, { BorderOutlined, FileOutlined, FilePdfFilled, FilePdfOutlined, UserOutlined } from '@ant-design/icons';
import { MdMessage } from 'react-icons/md';
import { useLocalstorageState } from 'rooks';
import { RoleTag } from 'components/RoleTag';
import { PageContainer } from '@ant-design/pro-components';


const { Text } = Typography;

const StyledTable = styled(Table)`
.ant-table-tbody {
  .ant-table-cell:first-child {
    border-left: 4px solid transparent;
  }
}

.pending-reply {
  .ant-table-cell:first-child {
    border-left-color: #cf222e;
  }

  .ant-table-cell {
    background-color: #cf222e22;
    font-weight: 700;
  }

  &:hover {
    .ant-table-cell {
      background-color: #cf222e33;
    }
  }
}

.current-item {
  .ant-table-cell:first-child {
    border-left-color: #0FBFC4;
  }  
  .ant-table-cell {
    background-color: #0FBFC422;
  }
}
`;

const DEFAULT_QUERY_INFO = {
  text: '',
  page: 1,
  size: 50,
  orderField: 'createdAt',
  orderDirection: 'DESC'
};

const LOCAL_STORAGE_KEY = 'user_support_query';

const SupportListPage = () => {

  const [chatVisible, setChatVisible] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const eventSource$ = React.useRef(new Subject());
  const [queryInfo, setQueryInfo] = useLocalstorageState(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO);
  const [modal, contextHolder] = Modal.useModal();

  const columnDef = [
    {
      title: 'User',
      fixed: 'left',
      render: (_, item) => <Space>
        <UserNameCard userId={item.userId} searchText={queryInfo.text} />
        <Badge count={item.unreadCount} showZero={false} />
      </Space>
    },
    {
      title: 'Org',
      dataIndex: 'orgName',
      render: (value) => <HighlightingText search={queryInfo.text} value={value} />,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (role, item) => <RoleTag role={item.role} />
    },
    {
      title: 'Owner',
      dataIndex: 'orgOwner',
      render: (isOrgOwner, item) => isOrgOwner ? <Text strong><CheckOutlined /></Text> : null
    },

    {
      title: 'Last Contact At',
      dataIndex: 'lastMessageAt',
      render: (value) => <TimeAgo value={value} />
    },
    {
      width: 60,
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
              item.role !== 'guest' ? {
                menu: 'Impersonate',
                onClick: () => handleImpersonante(item)
              } : null,
              {
                menu: 'Resend invite',
                onClick: () => handleResendInvite(item)
              }
            ]}
          />
        )
      },
    },
  ].filter(x => !!x);


  const handleResendInvite = (user) => {
    switch (user.role) {
      case 'admin':
      case 'agent':

        reinviteMember$(user.email, true).subscribe(() => {
          modal.success({
            title: 'Resent invite',
            content: <>Has resent an invite email to email <Text code>{user.email}</Text></>
          });
        });
        break;
      case 'client':
        throw new Error('Not implemented yet')
      default:
        throw new Error('Not implemented yet')
    }
  }

  const loadList = () => {
    setLoading(true);

    return searchUserSupports$(queryInfo).pipe(
      finalize(() => setLoading(false))
    ).subscribe(
      resp => {
        setTotal(resp.count);
        setList(resp.data);
      }
    );
  }

  React.useEffect(() => {
    const load$ = loadList();
    return () => {
      load$.unsubscribe();
    }
  }, [queryInfo]);

  // Subscribe message events
  React.useEffect(() => {
    const es = subscribeSupportMessage();
    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      eventSource$.current.next(event);
      setList(list => {
        const item = list.find(x => x.userId === event.userId);
        if (item) {
          item.unreadCount += event.by === event.userId ? 1 : 0;
          return [...list];
        }
        return list;
      })
    }

    return () => {
      es?.close()
    }
  }, []);

  const updateQueryInfo = (queryInfo) => {
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

  const searchByQueryInfo = async () => {

  }

  const handleImpersonante = async (user) => {
    modal.confirm({
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

  const handleClearFilter = () => {
    setQueryInfo(q => ({ ...q, text: '' }));
  }

  const handlePaginationChange = (page, pageSize) => {
    setQueryInfo(q => ({ ...q, page, size: pageSize }));
  }


  return (
    <PageContainer
      loading={loading}
      ghost={true}
      header={{
        title: 'Users & Supports',
        extra: [
          <Input.Search
            key="search"
            placeholder="Search name or email"
            enterButton={<SearchOutlined />}
            onSearch={value => handleSearch(value)}
            onPressEnter={e => handleSearch(e.target.value)}
            onChange={e => handleSearchTextChange(e.target.value)}
            loading={loading}
            value={queryInfo?.text}
            allowClear
          />,
          <Button key="clear" danger ghost onClick={() => handleClearFilter()} icon={<ClearOutlined />}>Clear Filter</Button>,
          <Button key="refresh" type="primary" ghost onClick={() => loadList()} icon={<SyncOutlined />}></Button>
        ]
      }}
    >
      <StyledTable columns={columnDef}
        dataSource={list}
        size="small"
        scroll={{
          x: 'max-content'
        }}
        rowKey="userId"
        loading={loading}
        style={{ marginTop: 20 }}
        rowClassName={item => {
          const classNames = [];
          if (item === currentUser) {
            classNames.push('current-item');
          }
          if (item.unreadCount) {
            classNames.push('pending-reply');
          }
          return classNames.join(' ');
        }}
        onRow={item => {
          return {
            onDoubleClick: () => handleChatWith(item)
          }
        }}
        pagination={{
          current: queryInfo.page,
          pageSize: queryInfo.size,
          total: total,
          showTotal: total => `Total ${total}`,
          pageSizeOptions: [20, 50, 100],
          showSizeChanger: true,
          showQuickJumper: true,
          disabled: loading,
          onChange: handlePaginationChange,
          onShowSizeChange: (page, size) => {
            setQueryInfo(q => ({ ...q, page, size }));
          }
        }}
      />
      {contextHolder}
      <SupportReplyDrawer
        title={currentUser ? <UserNameCard userId={currentUser.userId} /> : null}
        userId={currentUser?.userId}
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        eventSource={eventSource$.current}
      />
    </PageContainer>

  );
};

SupportListPage.propTypes = {};

SupportListPage.defaultProps = {};

export default SupportListPage;
