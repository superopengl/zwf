import { Button, Typography, List, Card, Image, Col, Row } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { finalize } from 'rxjs/operators';
import { listPublishedResourcePages$ } from 'services/resourcePageService';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
const { Text, Paragraph, Title, Link: TextLink } = Typography;

const Container = styled(Row)`
  // margin: 0 auto 0 ;
  padding: 3rem 1rem;
  // max-width: 1000px;
  width: 100%;
  background-color: #F1F2F5;
  height: calc(100vh - 64px);
  // height: 100%;

  // .ant-list-item {
  //   padding-left: 0;
  //   padding-right: 0;
  // }
`;

export const ResourceListPage = React.memo(props => {

  useDocumentTitle('All resource pages');
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    setLoading(true);
    const sub$ = listPublishedResourcePages$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(setList);

    return () => sub$.unsubscribe();
  }, []);

  return <Container justify='center'>
    <Col flex="auto" style={{maxWidth: 1000}}>
    <List
      size="small"
      grid={{
        gutter: [16, 16],
        // column: 3,
        xs: 1,
        sm: 1,
        md: 2,
        lg: 3,
        xl: 3,
        xxl: 3
      }}
      dataSource={list}
      loading={loading}
      renderItem={item => <List.Item>
        <Card
          bordered={false}
          hoverable
          title={null}
          onClick={() => navigate(`/resource/${item.id}`)}
          cover={item.imageBase64 && <Image src={item.imageBase64} alt="picture" preview={false} style={{ padding: 24, maxHeight: 300 }} />}
        >
          <Text type="secondary">
            <small>
              <TimeAgo value={item.publishedAt} showTime={false} prefix="Published:" direction="horizontal" />
            </small>
          </Text>
          <Card.Meta title={item.title} description={item.brief + '...'} />
        </Card>
      </List.Item>}
    />
    </Col>
  </Container>
});

ResourceListPage.propTypes = {};

ResourceListPage.defaultProps = {};

export default ResourceListPage;
