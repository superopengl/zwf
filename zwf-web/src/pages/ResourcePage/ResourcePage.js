import React from 'react';
import { Skeleton, Typography, Space, Divider, Tag, Row, PageHeader } from 'antd';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { finalize } from 'rxjs/operators';
import { getPublishedResourcePage$ } from 'services/resourcePageService';
import { RawHtmlDisplay } from 'components/RawHtmlDisplay';
import { TimeAgo } from 'components/TimeAgo';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
const { Paragraph, Title, Text } = Typography;


const LayoutStyled = styled.div`
  margin: 48px auto 120px auto;
  padding: 3rem 1rem;
  max-width: 1000px;
`;

export const ResourcePage = (props) => {

  const { id } = props.match.params;

  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState();
  const [documentTitle, setDocumentTitle] = useDocumentTitle();

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

  // const keywords = (page.keywords ?? '').split(/\s/).map((w, i) => <Tag key={i}>{w}</Tag>)

  return <Loading loading={loading}>
    {page ? <LayoutStyled>
      <PageHeader
        title={<Title>{page.title}</Title>}
        ghost
      >
      <Text type="secondary">
        <small>
          <TimeAgo value={page.publishedAt} showTime={false} prefix="Published:" direction="horizontal" />
        </small>
      </Text>
      <Divider />
      <RawHtmlDisplay value={page.html} />
      </PageHeader>

    </LayoutStyled > : <Skeleton />}
  </Loading>
};

ResourcePage.propTypes = {};

ResourcePage.defaultProps = {};

export default ResourcePage;
