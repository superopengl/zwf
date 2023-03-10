import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Row, Tooltip, Drawer, Badge } from 'antd';
import {
  SyncOutlined, QuestionOutlined,
  SearchOutlined,
  ClearOutlined
} from '@ant-design/icons';

import { Space } from 'antd';
import { setUserTags } from 'services/userService';
import { impersonate$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import { HighlightingText } from 'components/HighlightingText';
import TagFilter from 'components/TagFilter';
import { listOrgs$ } from 'services/orgService';
import DropdownMenu from 'components/DropdownMenu';
import PromotionListPanel from 'pages/Promotion/PromotionListPanel';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { GiDominoMask } from 'react-icons/gi';
import Icon from '@ant-design/icons';
import { UserNameCard } from 'components/UserNameCard';

const { Text, Link: TextLink } = Typography;

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
  const [currentOrg, setCurrentOrg] = React.useState();
  const [list, setList] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [modal, contextHolder] = Modal.useModal();
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))


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
      title: 'Org',
      dataIndex: 'id',
      render: (value) => value && <Text code copyable ellipsis={true} style={{width: '6rem'}}>{value}</Text>,
    },
    {
      title: 'Tel',
      dataIndex: 'tel',
      render: (value) => value
    },
    {
      title: 'Owner User',
      render: (_, org) => <Tooltip title="Click to impersonate">
        <TextLink onClick={() => handleImpersonante(org)}>
          <UserNameCard userId={org.ownerUserId} type="link"/>
        </TextLink>
        </Tooltip>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (value) => value
    },
    {
      title: 'Current Billing Period',
      render: (value, item) => <Space>
        <TimeAgo value={item.periodFrom} accurate={false}/>
        -
        <TimeAgo value={item.periodTo} accurate={false}/>
      </Space>
    },
    {
      // title: 'Action',
      // fixed: 'right',
      width: 80,
      align: 'right',
      fixed: 'right',
      render: (text, org) => {
        return <Row>
          <Tooltip title="Impersonate owner">
            <Button icon={<Icon component={GiDominoMask} />} type="text" onClick={() => handleImpersonante(org)} />
          </Tooltip>
          <DropdownMenu
            config={[
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
        </Row>
      },
    },
  ].filter(x => !!x);

  const loadList = () => {
    setLoading(true);

    return listOrgs$().subscribe({
      next: list => setList(list),
      error: () => { },
      complete: () => setLoading(false),
    });
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

  const searchByQueryInfo = async () => {
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

  const handleImpersonante = async (org) => {
    modal.confirm({
      title: 'Impersonate',
      icon: <QuestionOutlined />,
      content: <>Impersonate the owner user of org <Text code>{org.name}</Text>?</>,
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
    <PageHeaderContainer
      title="Org Management"
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
        <Button key="clear" onClick={() => handleClearFilter()} icon={<ClearOutlined />}>Clear Filter</Button>,
        <Button key="refresh" onClick={() => loadList()} icon={<SyncOutlined />}></Button>
      ]}
    >

      <Space direction="vertical" style={{ width: '100%' }}>
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
        width={700}
      >
        {/* <Alert style={{ marginBottom: '0.5rem' }} type="warning" showIcon message="Changing email will change the login account. After changing, system will send out a new invitation to the new email address to reset your password." /> */}

        {currentOrg && <PromotionListPanel org={currentOrg} onOk={() => {
          setPromotionCodeDrawerVisible(false);
          loadList();
        }} />}
      </Drawer>
      {contextHolder}
    </PageHeaderContainer>
  );
};

OrgListPage.propTypes = {};

OrgListPage.defaultProps = {};

export default OrgListPage;
