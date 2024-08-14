import React from 'react';
import { Skeleton, Typography, Space, Divider, Tag, Row, PageHeader, Image, Button, BackTop } from 'antd';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { finalize } from 'rxjs/operators';
import { getPublishedResourcePage$ } from 'services/resourcePageService';
import { RawHtmlDisplay } from 'components/RawHtmlDisplay';
import { TimeAgo } from 'components/TimeAgo';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { useParams, useNavigate } from "react-router-dom";
import { LeftOutlined, UpOutlined } from '@ant-design/icons';
const { Paragraph, Title, Text } = Typography;


const LayoutStyled = styled.div`
  margin: 0 auto 120px auto;
  padding: 2rem 1rem;
  max-width: 700px;

  .head-image {
      float: left;
      margin: 0 2rem 2rem 0;
  }
`;


export const ResourcePage = (props) => {

  const params = useParams();
  const { id } = params;

  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState();
  const [documentTitle, setDocumentTitle] = useDocumentTitle();
  const navigate = useNavigate();

  React.useEffect(() => {
    const sub$ = getPublishedResourcePage$(id)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(p => {
        setPage(p);
        setDocumentTitle(p.title);
      });
    return () => sub$.unsubscribe();
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  // const keywords = (page.keywords ?? '').split(/\s/).map((w, i) => <Tag key={i}>{w}</Tag>)

  return <Loading loading={loading}>
    {page ? <LayoutStyled>
      <Button type="text" icon={<LeftOutlined />} style={{ color: '#4B5B76' }} onClick={() => navigate('/resource')}>Back</Button>
      {page.readingTime?.text && <Paragraph style={{ textAlign: 'center', margin: '0 auto' }}>
        {page.readingTime?.text}
      </Paragraph>}
      <Title style={{ textAlign: 'center', margin: '2rem auto' }}>{page.title}</Title>
      <Paragraph type="secondary" level={5} style={{ textAlign: 'center', margin: '2rem auto' }}>
        <TimeAgo value={page.publishedAt} showTime={false} prefix="By ZeeWorkflow Team, " direction="horizontal" />
      </Paragraph>
      <Image preview={false} src={page.imageBase64} width="100%" alt="picture" style={{ borderRadius: 4, marginBottom: '2rem' }} />
      <Paragraph>
        <RawHtmlDisplay value={page.html} />
      </Paragraph>
      {/* <Row justify='center'>
        <Button icon={<UpOutlined />} style={{ justifyContent: 'center' }} onClick={handleBackToTop}>Back to Top</Button>
      </Row> */}
    </LayoutStyled > : <Skeleton />}
  </Loading>
};

ResourcePage.propTypes = {};

ResourcePage.defaultProps = {};

export default ResourcePage;
