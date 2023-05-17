import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Form, Tooltip, Tag, Drawer, Radio } from 'antd';
import {
  DeleteOutlined, SafetyCertificateOutlined, UserAddOutlined, GoogleOutlined, SyncOutlined, QuestionOutlined,
  SearchOutlined,
  UserOutlined,
  ClearOutlined,
  MinusOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space, Pagination } from 'antd';
import { searchUsers, deleteUser, setPasswordForUser, setUserTags } from 'services/userService';
import { inviteUser$, impersonate$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { FaTheaterMasks } from 'react-icons/fa';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import HighlightingText from 'components/HighlightingText';
import CheckboxButton from 'components/CheckboxButton';
import TagSelect from 'components/TagSelect';
import { listUserTags, saveUserTag } from 'services/userTagService';
import ReactDOM from 'react-dom';
import TagFilter from 'components/TagFilter';
import { listOrgs$ } from 'services/orgService';
import DropdownMenu from 'components/DropdownMenu';
import PromotionListPanel from 'pages/Promotion/PromotionListPanel';


const { Text, Paragraph } = Typography;

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

const OrgListPage = () => {

  const [promotionCodeDrawerVisible, setPromotionCodeDrawerVisible] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [currentOrg, setCurrentOrg] = React.useState();
  const [list, setList] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [inviteVisible, setInviteVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))

  const handleTagChange = async (user, tags) => {
    await setUserTags(user.id, tags);
  }

  const columnDef = [
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: 'left',
      render: (text) => <HighlightingText search={queryInfo.text} value={text} />,
    },
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   render: (value, item) => <Text code>{value}</Text>,
    // },
    {
      title: 'Domain',
      dataIndex: 'domain',
      render: (value) => <Text code>{value}</Text>
    },
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      render: (value) => value
    },
    {
      title: 'Tel',
      dataIndex: 'tel',
      render: (value) => value
    },
    {
      title: 'Owner User',
      dataIndex: 'ownerEmail',
      render: (value) => value
    },
    // {
    //   title: 'Login Type',
    //   dataIndex: 'loginType',
    //   render: (text) => text === 'local' ? <Tag color="#333333">Local</Tag> : <Tag icon={<GoogleOutlined />} color="#4c8bf5">Google</Tag>
    // },
    {
      title: 'Next pay / trial end',
      dataIndex: 'subscription',
      render: (value, item) => <Space>
        <TimeAgo value={item.subscriptionEnd} showTime={false} />
        {item.isTrial && <Tag>Trial</Tag>}
      </Space>
    },
    {
      title: 'Licenses',
      dataIndex: 'seats',
      render: (value, item) => value
    },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      align: 'right',
      fixed: 'right',
      render: (text, org) => {
        return (
          <DropdownMenu
            config={[
              {
                menu: 'Impersonate',
                onClick: () => handleImpersonante(org)
              },
              {
                menu: 'Billing',
                onClick: () => handleOpenBilling(org)
              },
              {
                menu: 'Promotion code',
                onClick: () => handleOpenPromotionCode(org)
              },
            ]}
          />
        )
      },
    },
  ].filter(x => !!x);

  const loadList = () => {
    setLoading(true);

    return listOrgs$().subscribe(
      list => setList(list),
      () => { },
      () => {
        setLoading(false);
      }
    );
  }

  React.useEffect(() => {
    const load$ = loadList();
    return () => {
      load$.unsubscribe();
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
    try {
      setLoading(true);
      const resp = await searchUsers(queryInfo);
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

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, email } = item;
    Modal.confirm({
      title: <>Delete user</>,
      content: <>Delete user <Text code>{email}</Text>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteUser(id);
        await searchByQueryInfo(queryInfo);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const handleImpersonante = async (org) => {
    Modal.confirm({
      title: 'Impersonate',
      icon: <QuestionOutlined />,
      content: <>To impersonate org <Text code>{org.name}</Text>?</>,
      okText: 'Yes, impersonate',
      maskClosable: true,
      onOk: () => {
        impersonate$(org.ownerEmail)
          .subscribe(() => {
            reactLocalStorage.clear();
            window.location = '/';
          });
      }
    })
  }

  const handleOpenBilling = (org) => {
    setCurrentOrg(org);
  }

  const handleOpenPromotionCode = (org) => {
    setCurrentOrg(org);
    setPromotionCodeDrawerVisible(true);
  }

  const handleNewUser = () => {
    setInviteVisible(true);
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
            <Button type="primary" ghost onClick={() => handleNewUser()} icon={<UserAddOutlined />}>Invite Member</Button>
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
      </Space>
      <Drawer
        visible={promotionCodeDrawerVisible}
        destroyOnClose={true}
        maskClosable={true}
        title={<>{currentOrg?.name} - Promotion Codes</>}
        onClose={() => setPromotionCodeDrawerVisible(false)}
        footer={null}
        width={500}
      >
        {/* <Alert style={{ marginBottom: '0.5rem' }} type="warning" showIcon message="Changing email will change the login account. After changing, system will send out a new invitation to the new email address to reset your password." /> */}

        {currentOrg && <PromotionListPanel org={currentOrg} onOk={() => {
          setPromotionCodeDrawerVisible(false);
          loadList();
        }} />}
      </Drawer>
    </ContainerStyled>

  );
};

OrgListPage.propTypes = {};

OrgListPage.defaultProps = {};

export default withRouter(OrgListPage);
