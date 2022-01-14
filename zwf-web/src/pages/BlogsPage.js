// import 'App.css';
import { Layout, Typography } from 'antd';
import { Loading } from 'components/Loading';
import React from 'react';
import { listBlog } from 'services/blogService';
import styled from 'styled-components';
import BlogList from '../components/BlogList';

const { Title } = Typography;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;

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


const BlogsPage = () => {

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const loadList = async () => {
    setLoading(true);
    const list = await listBlog();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  return (
    <LayoutStyled>
      {/* <BarStyled></BarStyled> */}
      <ContainerStyled>
        <Title level={2} style={{ textAlign: 'center' }}>Blog Posts</Title>
        <Loading loading={loading}>
          <BlogList value={list} readonly={true} />
        </Loading>
      </ContainerStyled>
    </LayoutStyled>
  );
}

BlogsPage.propTypes = {};

BlogsPage.defaultProps = {};

export default BlogsPage;
