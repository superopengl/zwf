import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Form } from 'antd';
import Icon, {
  SyncOutlined,
  SearchOutlined,
  RightOutlined,
  MinusCircleOutlined
} from '@ant-design/icons';

import { Space } from 'antd';
import { setOrgClientTags$, searchOrgClients$, saveClientRemark$, toggleOrgClientActive$ } from 'services/clientService';
import { TagSelect } from 'components/TagSelect';
import { TaskStatusTag } from 'components/TaskStatusTag';
import { finalize } from 'rxjs/operators';
import { useLocalstorageState } from 'rooks';
import { InviteClientModal } from 'components/InviteClientModal';
import { TimeAgo } from 'components/TimeAgo';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';
import { useCreateTaskModal } from 'hooks/useCreateTaskModal';
import { FaUserPlus } from 'react-icons/fa';
import { ClientNameCard } from 'components/ClientNameCard';
import { useNavigate } from 'react-router-dom';
import DropdownMenu from 'components/DropdownMenu';
import { MdAddReaction, MdDashboardCustomize, MdOutlineAddReaction } from 'react-icons/md';
import { CheckboxButton } from 'components/CheckboxButton';


const { Paragraph, Text, Link: TextLink } = Typography;

const ContainerStyled = styled.div`

`;

const StyledTable = styled(Table)`
.ant-table-cell {
  vertical-align: top;
}

.ant-table-cell:first-child {
  border-left: 2px solid transparent;
}

.client-inactive {
  
  .ant-table-cell:first-child {
    border-left: 2px solid red;
  }

  // &:hover {
  //   .ant-table-cell {
  //     background-color: yellow;
  //   }
  // }
}
`

const DEFAULT_QUERY_INFO = {
  text: '',
  tags: [],
  page: 1,
  size: 50,
  orderField: 'createdAt',
  orderDirection: 'DESC',
  showDeactive: false,
};

const LOCAL_STORAGE_KEY = 'user_query';

const OrgClientListPage = () => {
  useAssertRole(['admin', 'agent'])
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [inviteUserModalVisible, setInviteUserModalVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [queryInfo, setQueryInfo] = useLocalstorageState(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO)
  const [openTaskCreator, taskCreatorContextHolder] = useCreateTaskModal();
  const [editingKey, setEditingKey] = React.useState('');
  const navigate = useNavigate();

  const isEditing = (record) => record.id === editingKey;

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



  const handleTagFilterChange = (tags) => {
    searchByQueryInfo$({ ...queryInfo, page: 1, tags });
  }


  const handlePaginationChange = (page, pageSize) => {
    searchByQueryInfo$({ ...queryInfo, page, size: pageSize });
  }

  const handleGoToTasks = (item, status) => {

  }

  const handleRemarkChange = (item, remark) => {
    saveClientRemark$(item.id, remark)
      .subscribe(() => {
        item.remark = remark;
        setEditingKey(null);
      })
  }

  const toggleClientActive = (item, active) => {
    toggleOrgClientActive$(item.id, active)
      .subscribe({
        next: () => loadList$()
      });
  }

  const handleCreateTaskForClient = (user) => {
    openTaskCreator({
      client: user,
    });
  }

  const handleToggleDeactiveClients = (showDeactive) => {
    searchByQueryInfo$({ ...queryInfo, showDeactive });
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
        <ClientNameCard id={item.id} allowChangeAlias={false && isEditing(item)} />
      </Space>
    },
    {
      title: "Notes",
      dataIndex: 'remark',
      width: 200,
      render: (value, item) => isEditing(item) ? <Form
        onFinish={values => handleRemarkChange(item, values.remark)}
      >
        <Form.Item
          name="remark"
          extra="Enter to save"
          style={{ marginBottom: 4 }}
        >
          <Input.TextArea
            bordered={true}
            defaultValue={value}
            autoSize={{ minRows: 2 }}
          />
        </Form.Item>
        <Form.Item
          style={{ marginBottom: 0, display: 'flex', justifyContent: 'end' }}
        >
          <Button htmlType='submit' type="primary">Save</Button>
        </Form.Item>
      </Form>
        : <Paragraph>{value}</Paragraph>,
    },
    {
      title: <span style={{ fontWeight: 400 }}><TagSelect 
      value={queryInfo.tags} onChange={handleTagFilterChange} 
      allowClear={true} 
      placeholder="Filter by tags"
      /></span>,
      dataIndex: 'tags',
      width: 300,
      render: (value, item) =>
        <TagSelect value={value}
          onChange={tags => handleTagChange(item, tags)}
          bordered={false}
          inPlaceEdit={true}
          readonly={!isEditing(item)}
          placeholder="Click to select tags"
        />
    },
    {
      title: "Started from",
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
      render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'todo')}>{value}</TextLink> : null,
    },
    {
      title: <TaskStatusTag status="in_progress" />,
      dataIndex: 'countInProgress',
      width: 40,
      align: 'right',
      render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'in_progress')}>{value}</TextLink> : null,
    },
    {
      title: <TaskStatusTag status="action_required" />,
      dataIndex: 'countActionRequired',
      width: 40,
      align: 'right',
      render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'action_required')}>{value}</TextLink> : null,
    },
    {
      title: <TaskStatusTag status="done" />,
      dataIndex: 'countDone',
      width: 40,
      align: 'right',
      render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'done')}>{value}</TextLink> : null,
    },
    // {
    //   title: <TaskStatusTag status="archived" />,
    //   dataIndex: 'countArchived',
    //   width: 40,
    //   align: 'right',
    //   render: (value, item) => +value ? <TextLink onClick={() => handleGoToTasks(item, 'archived')}>{value}</TextLink> : null,
    // },
    {
      width: 40,
      align: 'right',
      fixed: 'right',
      render: (text, item) => <DropdownMenu
        config={item.active ? [
          {
            icon: <Icon component={MdDashboardCustomize} />,
            menu: 'Create task',
            onClick: () => handleCreateTaskForClient(item)
          },
          {
            menu: '-'
          },
          {
            icon: <Text type="danger"><MinusCircleOutlined /></Text>,
            menu: <Text type="danger">De-activate</Text>,
            onClick: () => toggleClientActive(item, false)
          }
        ] : [
          {
            icon: <Icon component={MdAddReaction} />,
            menu: 'Re-activate',
            onClick: () =>  toggleClientActive(item, true)
          }
        ]}
      />
    },
    // {
    //   width: 40,
    //   align: 'right',
    //   render: (text, item) => <Button type="text" icon={<RightOutlined/>}/>
    // },
  ].filter(x => !!x);

  return (
    <ContainerStyled>
      {editingKey}
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
          <CheckboxButton key="refresh" danger icon={<SyncOutlined />} value={queryInfo.showDeactive} onChange={handleToggleDeactiveClients}>
            Show inactive clients
          </CheckboxButton>,
          <Button key="refresh" icon={<SyncOutlined />} onClick={() => loadList$()}></Button>,
          <Button key="invite" ghost icon={<Icon component={FaUserPlus} />} type="primary" onClick={() => setInviteUserModalVisible(true)}>Add New Client</Button>
        ]}
      >
        <StyledTable columns={columnDef}
          align="top"
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
          rowClassName={(item) => item.active ? '' : 'client-inactive'}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                // setEditingKey(record.id);
                navigate(`/client/${record.id}`);
              }, // click row
              onDoubleClick: (event) => { }, // double click row
              onContextMenu: (event) => { }, // right button click row
              onMouseEnter: (event) => {
              }, // mouse enter row
              onBlur: (event) => {
                // setEditingKey(null);
              }, // mouse leave row
            };
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
      <InviteClientModal open={inviteUserModalVisible}
        onOk={(newClientId) => {
          setInviteUserModalVisible(false);
          navigate(`/client/${newClientId}`);
        }}
        onCancel={() => setInviteUserModalVisible(false)} />
      {taskCreatorContextHolder}
    </ContainerStyled>

  );
};

OrgClientListPage.propTypes = {};

OrgClientListPage.defaultProps = {};

export default OrgClientListPage;
