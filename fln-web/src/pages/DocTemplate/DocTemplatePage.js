import {
  DeleteOutlined, EditOutlined, PlusOutlined
} from '@ant-design/icons';
import { Button, Drawer, Layout, Modal, Space, Table, Tooltip, Typography } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import DocTemplateForm from './DocTemplateForm';
import React from 'react';
import { deleteDocTemplate, listDocTemplate } from 'services/docTemplateService';
import styled from 'styled-components';

const { Title, Text } = Typography;

const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;
  // height: 100%;
  // height: calc(100vh + 64px);
`;

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;
const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;
`;



export const DocTemplatePage = () => {
  const columnDef = [
    {
      title: 'Doc Template Name',
      dataIndex: 'name',
      render: (text) => text
    },
    {
      title: 'Description & Help',
      dataIndex: 'description',
      render: (text) => text
    },
    {
      title: <>Auto matched fields</>,
      dataIndex: 'variables',
    render: (value) => <>{(value || []).map(x => <Text style={{display: 'inline-block'}} key={x} code>{`{{${x}}}`}</Text>)}</>
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
      render: (text, record) => (
        <Space size="small">
          <Tooltip placement="bottom" title="Edit doc template">
            <Button type="link" icon={<EditOutlined />} onClick={e => handleEdit(e, record)} />
          </Tooltip>
          <Tooltip placement="bottom" title="Delete doc template">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];


  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentId, setCurrentId] = React.useState();


  const handleEdit = (e, item) => {
    e.stopPropagation();
    setCurrentId(item.id);
    setDrawerVisible(true);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, name } = item;
    Modal.confirm({
      title: <>Delete Jot Template <strong>{name}</strong>?</>,
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
    loadList();
  }, [])

  const handleCreateNew = () => {
    setCurrentId(undefined);
    setDrawerVisible(true);
  }

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  }


  return (
    <LayoutStyled>
      
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Doc Template Management</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Doc Template</Button>
          </Space>
          <Table columns={columnDef}
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
          />
        </Space>
        <StyledDrawer
          title={!currentId ? 'New Doc Template' : 'Edit Doc Template'}
          placement="right"
          closable={true}
          visible={drawerVisible}
          onClose={() => handleDrawerClose()}
          destroyOnClose={true}
          width={9999}
          footer={null}
        >
          <DocTemplateForm id={currentId} onClose={() => handleDrawerClose()} onOk={() => { handleDrawerClose(); loadList() }}></DocTemplateForm>
        </StyledDrawer>
      </ContainerStyled>
    </LayoutStyled >
  );
};

DocTemplatePage.propTypes = {};

DocTemplatePage.defaultProps = {};

export default DocTemplatePage;
