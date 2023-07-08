import {
  DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, SearchOutlined
} from '@ant-design/icons';
import { Button, Drawer, Layout, Modal, Space, Table, Tooltip, Typography, List, Row, Input, Card } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import DocTemplateForm from './DocTemplateForm';
import React from 'react';
import { deleteDocTemplate, listDocTemplate, listDocTemplate$ } from 'services/docTemplateService';
import styled from 'styled-components';
import DropdownMenu from 'components/DropdownMenu';
import HighlightingText from 'components/HighlightingText';
import { DocTemplateIcon, TaskTemplateIcon } from '../../components/entityIcon';
import { withRouter, Link } from 'react-router-dom';
import { finalize } from 'rxjs/operators';

const { Text, Paragraph } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
  }
`;

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
  min-width: 350px;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;


export const DocTemplateListPage = props => {
  const columnDef = [
    {
      render: (text, item) => <Text>
        <big>{item.name}</big>
        <br />
        <Text type="secondary">{item.description}</Text>
      </Text>
    },
    {
      title: <>Variables</>,
      dataIndex: 'variables',
      render: (value) => <>{(value || []).map(x => <Text style={{ display: 'inline-block' }} key={x} code>{x}</Text>)}</>
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (text) => <TimeAgo value={text} />
    },
    {
      title: 'Updated At',
      dataIndex: 'lastUpdatedAt',
      render: (text) => <TimeAgo value={text} />
    },
    {
      // title: 'Action',
      align: 'right',
      width: 100,
      render: (text, record) => (
        <Space size="small">
          <Tooltip placement="bottom" title="Test doc template">
            <Button type="link" icon={<EyeOutlined />} onClick={e => handlePreview(record)} />
          </Tooltip>
          <Tooltip placement="bottom" title="Edit doc template">
            <Button type="link" icon={<EditOutlined />} onClick={e => handleEdit(record)} />
          </Tooltip>
          <Tooltip placement="bottom" title="Delete doc template">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={e => handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];


  const [list, setList] = React.useState([]);
  const [filteredList, setFilteredList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentId, setCurrentId] = React.useState();

  React.useEffect(() => {
    setFilteredList(list.filter(x => !searchText || x.name.toLowerCase().includes(searchText.toLowerCase())))
  }, [list, searchText])

  const handleEditOne = (id) => {
    props.history.push(`/doc_template/${id}`);
  }

  const handleEdit = (item) => {
    handleEditOne(item.id);
  }

  const handleDelete = async (item) => {
    const { id, name } = item;
    Modal.confirm({
      title: <>Delete Dot Template <strong>{name}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteDocTemplate(id);
        await loadList();
        setLoading(false);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const loadList = async () => {
    setLoading(true);
    const list = await listDocTemplate();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    setLoading(true);
    const subscription$ = listDocTemplate$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(list => {
        setList(list);
      });

    return () => subscription$.unsubscribe();
  }, []);

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  }

  const handleCreateNew = () => {
    props.history.push('/doc_template/new');
  }

  const handleSearchFilter = (text) => {
    setSearchText(text);
  }

  const handlePreview = (item) => {
  }

  return (<>
    <LayoutStyled>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row justify="space-between">
          <Input placeholder="Filter task name"
            onChange={e => handleSearchFilter(e.target.value)}
            allowClear
            prefix={<Text type="secondary"><SearchOutlined /></Text>}
            style={{ width: 240 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Doc Template</Button>
        </Row>

        {/* <Table columns={columnDef}
          size="small"
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={false}
          // onChange={handleTableChange}
          onRow={(record) => ({
            onDoubleClick: () => {
              setCurrentId(record.id);
              setDrawerVisible(true);
            }
          })}
        /> */}

        <List
          size="small"
          grid={{
            gutter: [24, 24],
            xs: 1,
            sm: 1,
            md: 1,
            lg: 2,
            xl: 3,
            xxl: 4
          }}
          dataSource={filteredList}
          loading={loading}
          locale={{
            emptyText: <div style={{ margin: '30px auto' }}>
              <Paragraph type="secondary">
                There is no doc template. Let's start from a one!
              </Paragraph>
              <Link to="/task_template/new">Create new doc template</Link>
            </div>
          }}
          renderItem={item => <List.Item>
            <Card
              // size="small"
              bordered={true}
              hoverable
              // type="inner"
              title={<Space>
                <DocTemplateIcon />
                <HighlightingText search={searchText} value={item.name} />
              </Space>}
              extra={<DropdownMenu
                config={[
                  {
                    menu: 'Edit',
                    onClick: () => handleEdit(item)
                  },
                  // {
                  //   menu: 'Preview',
                  //   onClick: () => handlePreview(item)
                  // },
                  {
                    menu: <Text type="danger">Delete</Text>,
                    onClick: () => handleDelete(item)
                  },
                ].filter(x => !!x)}
              />}
              bodyStyle={{ paddingTop: 16 }}
              onClick={() => handleEdit(item)}
            >
              <Space size="large">
                <TimeAgo key="1" value={item.createdAt} showTime={false} prefix={<Text type="secondary">Created:</Text>} direction="horizontal" />
                <TimeAgo key="2" value={item.lastUpdatedAt} showTime={false} prefix={<Text type="secondary">Updated:</Text>} direction="horizontal" />
              </Space>
              <Paragraph style={{ marginBottom: 0, marginTop: 10 }} ellipsis={{ row: 3 }}>{item.description}</Paragraph>
            </Card>
          </List.Item>}
        />

        {/* <StyledDrawer
          title={!currentId ? 'New Doc Template' : 'Edit Doc Template'}
          placement="right"
          closable={true}
          visible={drawerVisible}
          onClose={() => handleDrawerClose()}
          destroyOnClose={true}
          width="calc(100vw - 280px)"
          footer={null}
        >
          <DocTemplateForm
            id={currentId}
            onClose={() => handleDrawerClose()}
            onOk={() => { handleDrawerClose(); loadList() }}
          />
        </StyledDrawer> */}
      </Space>

    </LayoutStyled>
  </>
  );
};

DocTemplateListPage.propTypes = {};

DocTemplateListPage.defaultProps = {};

export default withRouter(DocTemplateListPage);
