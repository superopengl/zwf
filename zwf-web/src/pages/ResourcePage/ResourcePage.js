import React from 'react';
import { Skeleton, Typography, Space, Divider, Tag, Row, Grid, Image, Button, Col } from 'antd';
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
const { useBreakpoint } = Grid;

const LayoutStyled = styled.div`
  margin: 0 auto;
  padding: 1rem 1rem 3rem;
  max-width: 700px;

  .head-image {
      float: left;
      margin: 0 2rem 2rem 0;
  }
`;


export const ResourcePage = (props) => {

  const params = useParams();
  const { key } = params;

  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState();
  const [documentTitle, setDocumentTitle] = useDocumentTitle();
  const navigate = useNavigate();

  const screens = useBreakpoint();

  React.useEffect(() => {
    const sub$ = getPublishedResourcePage$(key)
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
      <Button type="text" icon={<LeftOutlined />} style={{ color: '#4B5B76', position: 'relative', left: -16 }} onClick={() => navigate('/resource')}>Back</Button>
      <Image preview={false} src={page.imageBase64} width="100%" alt="picture" style={{ borderRadius: 4, margin: '1rem auto' }} />
      <Title style={{ textAlign: screens.xs ? 'left' : "center", margin: '2rem auto' }}>{page.title}</Title>
      <Row style={{ marginBottom: 32 }} justify={screens.xs ? 'left' : "center"} gutter={32}>
        <Col>
        <Text type="secondary" >
          {page.readingTime?.text}
        </Text>
        </Col>
        <Col>
        <Text type="secondary" >By ZeeWorkflow Team</Text>
        </Col>
        <Col>
        <Text type="secondary">
          <TimeAgo value={page.publishedAt} showTime={false} />
        </Text>
        </Col>

      </Row>
      <Paragraph style={{ fontSize: 16, textAlign: 'left' }}>
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
