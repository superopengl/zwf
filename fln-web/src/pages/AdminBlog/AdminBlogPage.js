import {
  PlusOutlined
} from '@ant-design/icons';
import { Button, Drawer, Layout, Modal, Space, Typography } from 'antd';

import BlogForm from './BlogForm';
import React from 'react';
import styled from 'styled-components';
import { deleteBlog, listBlog } from 'services/blogService';
import 'react-markdown-editor-lite/lib/index.css';
import BlogList from '../../components/BlogList';
import { Loading } from 'components/Loading';

const { Title } = Typography;


const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;
  // height: 100%;
  // height: calc(100vh + 64px);

  .rc-md-editor {
    border: none;

    .section-container {
      padding: 0 !important;
    }
  }
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

export const AdminBlogPage = () => {
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentBlog, setCurrentBlog] = React.useState();


  const handleEdit = (item) => {
    setCurrentBlog(item);
    setDrawerVisible(true);
  }

  const handleDelete = async (item) => {
    const { id, title } = item;
    Modal.confirm({
      title: <>To delete blog post <strong>{title}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteBlog(id);
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
    const list = await listBlog();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  const handleCreateNew = () => {
    setCurrentBlog(undefined);
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
            <Title level={2} style={{ margin: 'auto' }}>Blog Post Management</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Post</Button>
          </Space>
          <Loading loading={loading}>
            <BlogList value={list} readonly={false} onEdit={handleEdit} onDelete={handleDelete} />
          </Loading>

        </Space>
        <StyledDrawer
          title={!currentBlog ? 'New Blog Post' : 'Edit Blog Post'}
          placement="right"
          closable={true}
          visible={drawerVisible}
          onClose={() => handleDrawerClose()}
          destroyOnClose={true}
          width={9999}
          footer={null}
        >
          <BlogForm blog={currentBlog} onOk={() => { handleDrawerClose(); loadList() }}></BlogForm>
        </StyledDrawer>
      </ContainerStyled>
    </LayoutStyled >
  );
};

AdminBlogPage.propTypes = {};

AdminBlogPage.defaultProps = {};

export default AdminBlogPage;
