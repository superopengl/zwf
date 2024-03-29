import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Drawer, Badge, Row } from 'antd';
import {
  SyncOutlined, QuestionOutlined,
  SearchOutlined,
  ClearOutlined,
  CheckOutlined,
  MessageOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';

import { Space } from 'antd';
import { impersonate$, reinviteMember$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { HighlightingText } from 'components/HighlightingText';
import DropdownMenu from 'components/DropdownMenu';
import { searchUserSupports$ } from 'services/supportService';
import { filter, finalize } from 'rxjs/operators';
import { SupportReplyDrawer } from 'components/SupportReplyDrawer';
import { Subject } from 'rxjs';
import { UserNameCard } from 'components/UserNameCard';
import Icon from '@ant-design/icons';
import { useLocalstorageState } from 'rooks';
import { RoleTag } from 'components/RoleTag';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { Tooltip } from 'antd';
import { GiDominoMask } from 'react-icons/gi';
import { compareDates } from 'util/compareDates';
import { useAssertRole } from 'hooks/useAssertRole';
import { ClickToCopyTooltip } from 'components/ClickToCopyTooltip';
import { BsKeyFill } from 'react-icons/bs';
import { HiOutlineKey } from 'react-icons/hi';
import { IoKeyOutline } from 'react-icons/io5';
import { useAuthUser } from 'hooks/useAuthUser';
import { useZevent } from "hooks/useZevent";
import { ZeventContext } from 'contexts/ZeventContext';

const { Text, Link: TextLink } = Typography;

const StyledTable = styled(Table)`
.ant-table-tbody {
  .ant-table-cell:first-child {
    border-left: 2px solid transparent;
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

.user-suspended {
  .ant-table-cell:first-child {
    border-left-color: #F53F3F;
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
  useAssertRole(['system']);
  const [chatVisible, setChatVisible] = React.useState(false);
  const [clientCommentVisible, setClientCommentVisible] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [user, setAuthUser] = useAuthUser();
  const [queryInfo, setQueryInfo] = useLocalstorageState(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO);
  const [modal, contextHolder] = Modal.useModal();
  const { onNewZevent$ } = React.useContext(ZeventContext);

  React.useEffect(() => {
    const sub$ = onNewZevent$().pipe(
      filter(z => z.type === 'support')
    ).subscribe(z => {
      const { userId, payload } = z;
      setList(list => {
        const item = list.find(x => x.userId === userId);
        if (item) {
          if (payload.by === userId) {
            // Message from support requestor
            item.unreadCount += 1;
          } else {
            // Message from system
            item.unreadCount = 0;
          }
          return [...list];
        }
        return list;
      })
    });

    return () => sub$.unsubscribe()
  }, []);

  const columnDef = [
    {
      title: 'User',
      fixed: 'left',
      render: (_, item) => <Space>
        <ClickToCopyTooltip name="User ID" value={item.userId}><Icon component={IoKeyOutline} /></ClickToCopyTooltip>
          <UserNameCard userId={item.userId} searchText={queryInfo.text} type="link" onClick={() => handleChatWith(item)} />
      </Space >
    },
    {
      title: 'Org',
      dataIndex: 'orgName',
      sorter: {
        compare: (a, b) => a?.orgName?.localeCompare(b.orgName)
      },
      render: (value, item) => item.orgId && <Space>
        <ClickToCopyTooltip name="Org ID" value={item.orgId}><Icon component={IoKeyOutline} /></ClickToCopyTooltip>
        <HighlightingText search={queryInfo.text} value={value} />
      </Space>
    },
    // {
    //   title: 'Org',
    //   dataIndex: 'orgId',
    //   sorter: {
    //     compare: (a, b) => a?.orgId?.localeCompare(b.orgId)
    //   },
    //   render: (value) => value && <Text code copyable ellipsis={true} style={{ width: '6rem' }}>{value}</Text>,
    // },
    {
      title: 'Role',
      dataIndex: 'role',
      sorter: {
        compare: (a, b) => a?.role?.localeCompare(b.role)
      },
      render: (role, item) => <RoleTag role={item.role} />
    },
    {
      title: 'Owner',
      dataIndex: 'orgOwner',
      render: (isOrgOwner, item) => isOrgOwner ? <Text strong><CheckOutlined /></Text> : null
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      sorter: {
        compare: (a, b) => compareDates(a.createdAt, b.createdAt)
      },
      render: (value) => <TimeAgo value={value} />
    },
    {
      title: 'Last Contact At',
      dataIndex: 'lastMessageAt',
      sorter: {
        compare: (a, b) => compareDates(a.lastMessageAt, b.lastMessageAt)
      },
      render: (value) => <TimeAgo value={value} />
    },
    {
      width: 120,
      align: 'right',
      // fixed: 'right',
      render: (text, item) => {
        return <Space>
          <Tooltip title="Support chat">
            <Badge count={item.unreadCount} showZero={false}>
              <Button icon={<CustomerServiceOutlined />} type="text" onClick={() => handleChatWith(item)} disabled={item.role === 'system' || item.role === 'guest'} />
            </Badge>
          </Tooltip>
          <Tooltip title="Impersonate">
            <Button icon={<Icon component={GiDominoMask} />} type="text" onClick={() => handleImpersonante(item)} disabled={item.role === 'system' || item.role === 'guest'} />
          </Tooltip>
          <DropdownMenu
            disabled={item.role === 'system' || item.role === 'guest'}
            config={[
              item.role === 'client' ? {
                menu: 'Comments',
                onClick: () => handleClientComments(item)
              } : null,
              {
                menu: 'Resend invite',
                onClick: () => handleResendInvite(item)
              }
            ]}
          />
        </Space>
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

  const handleClientComments = () => {
    setClientCommentVisible(true)
  }

  const handleImpersonante = async (user) => {
    modal.confirm({
      title: 'Impersonate',
      icon: <QuestionOutlined />,
      content: <>To impersonate user <Text code>{user.email}</Text>?</>,
      okText: 'Yes, impersonate',
      closable: true,
      maskClosable: true,
      autoFocusButton: 'ok',
      onOk: () => {
        impersonate$(user.userId)
          .subscribe(impersonatedUser => {
            setAuthUser(impersonatedUser, '/landing');
            // reactLocalStorage.clear();
            // window.location = '/';
          });
      },
      cancelButtonProps: {
        type: 'text'
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
    <PageHeaderContainer
      loading={loading}
      ghost={true}
      title='Users & Support'
      extra={[
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
      ]}
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
          if (item.suspended) {
            classNames.push('user-suspended');
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
      />
      <Drawer
        title="Comment"
        open={clientCommentVisible}
        onClose={() => setClientCommentVisible(false)}
      >
        Coming soon
      </Drawer>
    </PageHeaderContainer>

  );
};

SupportListPage.propTypes = {};

SupportListPage.defaultProps = {};

export default SupportListPage;
