import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Row, Tooltip, Drawer, Badge, Space } from 'antd';
import {
  SyncOutlined, QuestionOutlined,
  SearchOutlined,
  ClearOutlined,
  CheckOutlined,
  SendOutlined
} from '@ant-design/icons';

import { impersonate$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { reactLocalStorage } from 'reactjs-localstorage';
import { HighlightingText } from 'components/HighlightingText';
import TagFilter from 'components/TagFilter';
import { listOrgs$, sendReactivatingEmail$ } from 'services/orgService';
import DropdownMenu from 'components/DropdownMenu';
import PromotionListPanel from 'pages/Promotion/PromotionListPanel';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { GiDominoMask } from 'react-icons/gi';
import Icon from '@ant-design/icons';
import { UserNameCard } from 'components/UserNameCard';
import { useAssertRole } from 'hooks/useAssertRole';
import { ClickToCopyTooltip } from 'components/ClickToCopyTooltip';
import { IoKeyOutline } from 'react-icons/io5';
import { useAuthUser } from 'hooks/useAuthUser';
import { BsFillSendFill } from 'react-icons/bs';
import { notify } from 'util/notify';

const Container = styled.div`

.ant-table-tbody {
  .ant-table-cell:first-child {
    border-left: 2px solid #0FBFC4;
  }
}

.org-suspended {
  .ant-table-cell:first-child {
    border-left-color: #F53F3F;
  }
}

.org-trial {
  .ant-table-cell:first-child {
    border-left-color: transparent;
  }
}
`

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
  useAssertRole(['system'])
  const [promotionCodeDrawerVisible, setPromotionCodeDrawerVisible] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [currentOrg, setCurrentOrg] = React.useState();
  const [list, setList] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [modal, contextHolder] = Modal.useModal();
  const [user, setAuthUser] = useAuthUser();
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))

  const columnDef = [
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: 'left',
      sorter: {
        compare: (a, b) => a?.name?.localeCompare(b.name)
      },
      render: (text, item) => <Space>
        <Space><HighlightingText search={queryInfo.text} value={text} />{item.testing && <Text type="secondary"><sub>test</sub></Text>}</Space>
        <ClickToCopyTooltip name="Org ID" value={item.id}><Icon component={IoKeyOutline} /></ClickToCopyTooltip>
      </Space>
    },
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      sorter: {
        compare: (a, b) => a?.businessName?.localeCompare(b.businessName)
      },
      render: (value) => value
    },
    {
      title: 'Tel',
      dataIndex: 'tel',
      render: (value) => value
    },
    {
      title: 'Owner User',
      render: (_, org) => <Tooltip title="Click to impersonate">
        <UserNameCard userId={org.ownerUserId} type="link" onClick={() => handleImpersonante(org)} />
      </Tooltip>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      sorter: {
        compare: (a, b) => a?.type?.localeCompare(b.type)
      },
      render: (value) => value
    },
    {
      title: 'Current Billing Period',
      render: (value, item) => <Space>
        <TimeAgo value={item.periodFrom} accurate={false} />
        -
        <TimeAgo value={item.periodTo} accurate={false} />
      </Space>
    },
    {
      title: 'Suspended',
      dataIndex: 'suspended',
      render: (value, item) => value && <CheckOutlined />
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
                menu: 'Negotiated price',
                onClick: () => handleOpenPromotionCode(org)
              },
              org.suspended ? {
                menu: 'Send reactivating email',
                onClick: () => handleResendReactivateEmail(org)
              } : null,
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
      closable: true,
      maskClosable: true,
      autoFocusButton: 'ok',
      onOk: () => {
        impersonate$(org.ownerUserId)
          .subscribe(impersonatedUser => {
            setAuthUser(impersonatedUser, '/landing');
            // reactLocalStorage.clear();
          });
      },
      cancelButtonProps: {
        type: 'text'
      }
    })
  }


  const handleOpenPromotionCode = (org) => {
    setCurrentOrg(org);
    setPromotionCodeDrawerVisible(true);
  }

  const handleResendReactivateEmail = (org) => {
    modal.confirm({
      title: 'Send Reactivating Email',
      icon: <Icon component={BsFillSendFill} />,
      content: <>Send reactivating email to the admins of org <Text code>{org.name}</Text>?</>,
      okText: 'Yes, send',
      closable: true,
      maskClosable: true,
      autoFocusButton: 'cancel',
      onOk: () => {
        sendReactivatingEmail$(org.id).subscribe({
          next: () => {
            notify.success('Successfully sent out', <>The reactivating email has been sent out to the admins of org <Text code>{org.name}</Text>.</>)
          }
        });
      },
      cancelButtonProps: {
        type: 'text'
      }
    });
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
    <Container>
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
            bordered={false}
            style={{ marginTop: 20 }}
            rowClassName={item => item.suspended ? 'org-suspended' : item.type === 'trial' ? 'org-trial' : null}
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
          title={<>{currentOrg?.name} - Negotiated Price</>}
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
    </Container>
  );
};

OrgListPage.propTypes = {};

OrgListPage.defaultProps = {};

export default OrgListPage;
