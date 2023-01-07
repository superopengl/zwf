import {
  DeleteOutlined, EditOutlined, PlusOutlined
} from '@ant-design/icons';
import { Button, Drawer, Layout, Modal, Space, Table, Tooltip, Typography } from 'antd';
import HomeHeader from 'components/HomeHeader';
import { TimeAgo } from 'components/TimeAgo';
import TaskTemplateForm from 'pages/TaskTemplate/TaskTemplateForm';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { deleteTaskTemplate, listTaskTemplate } from 'services/taskTemplateService';
import styled from 'styled-components';

const { Title, Link } = Typography;

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



export const TaskTemplatePage = props => {

  const handleEditOne = (id) => {
    setCurrentId(id);
    setDrawerVisible(true);
  }
  
  const handleClickTemplate = (e, id) => {
    e.stopPropagation();
    handleEditOne(id);
  }

  const columnDef = [
    {
      title: 'Task Template Name',
      dataIndex: 'name',
      render: (text, record) => <Link onClick={e => handleClickTemplate(e, record.id)}>{text}</Link>
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
          <Tooltip placement="bottom" title="Edit task template">

          <Button type="link" icon={<EditOutlined />} onClick={e => handleEdit(e, record)} />
          </Tooltip>
          <Tooltip placement="bottom" title="Delete task template">
          <Button type="link" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const taskTemplateId = props.match.params.id;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(!!taskTemplateId);
  const [currentId, setCurrentId] = React.useState(taskTemplateId);

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
        await deleteTaskTemplate(id);
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
    const list = await listTaskTemplate();
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
      <HomeHeader></HomeHeader>
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
        <StyledTitleRow>
          <Title level={2} style={{ margin: 'auto' }}>Task Template Management</Title>
        </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Task Template</Button>
          </Space>
          <Table columns={columnDef}
            size="small"
            dataSource={list}
            rowKey="id"
            loading={loading}
            pagination={false}
            // onChange={handleTableChange}
            onRow={(record) => ({
              onDoubleClick: () => handleEditOne(record.id)
            })}
          />
        </Space>
        <StyledDrawer
          title={!currentId ? 'New Task Template' : 'Edit Task Template'}
          placement="right"
          closable={true}
          visible={drawerVisible}
          onClose={() => handleDrawerClose()}
          destroyOnClose={true}
          width={900}
          footer={null}
        >
          <TaskTemplateForm id={currentId} onClose={() => handleDrawerClose()} onOk={() => {handleDrawerClose(); loadList()}}></TaskTemplateForm>
        </StyledDrawer>
      </ContainerStyled>
    </LayoutStyled >
  );
};

TaskTemplatePage.propTypes = {};

TaskTemplatePage.defaultProps = {};

export default withRouter(TaskTemplatePage);
