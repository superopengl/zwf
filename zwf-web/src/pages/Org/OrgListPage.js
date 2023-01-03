import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Tag, Drawer, Badge } from 'antd';
import {
  SyncOutlined, QuestionOutlined,
  SearchOutlined,
  ClearOutlined} from '@ant-design/icons';

import { Space } from 'antd';
import { deleteUser, setUserTags } from 'services/userService';
import { impersonate$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import {HighlightingText} from 'components/HighlightingText';
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
      render: (text, item) => <Badge dot={item.testing} offset={[4, 2]}><HighlightingText search={queryInfo.text} value={text} /></Badge>
    },
    // {
    //   title: 'ID',
    //   dataIndex: 'id',
    //   render: (value, item) => <Text code>{value}</Text>,
    // },
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
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value) => value
    },
    {
      title: 'Period',
      render: (value, item) => <Space>
        <TimeAgo value={item.periodFrom} />
        -
        <TimeAgo value={item.periodTo} />
      </Space>
    },
    {
      // title: 'Action',
      // fixed: 'right',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (text, org) => {
        return (
          <DropdownMenu
            config={[
              {
                menu: 'Impersonate owner',
                onClick: () => handleImpersonante(org)
              },
              // {
              //   menu: 'Billing',
              //   onClick: () => handleOpenBilling(org)
              // },
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
        open={promotionCodeDrawerVisible}
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

export default OrgListPage;
