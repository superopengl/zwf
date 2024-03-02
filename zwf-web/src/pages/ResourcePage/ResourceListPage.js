import { Button, Typography, List, Card } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { finalize } from 'rxjs/operators';
import { listPublishedResourcePages$ } from 'services/resourcePageService';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
const { Text, Paragraph, Title, Link: TextLink } = Typography;

const Container = styled.div`
  margin: 48px auto 120px auto;
  padding: 1rem;
  max-width: 1000px;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;

  // .ant-list-item {
  //   padding-left: 0;
  //   padding-right: 0;
  // }
`;

export const ResourceListPage = React.memo(props => {

  useDocumentTitle('All resource pages');
  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const sub$ = listPublishedResourcePages$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(setList);

    return () => sub$.unsubscribe();
  }, []);

  return <Container>
    <List
      size="small"
      grid={{
        gutter: [24, 24],
        xs: 1,
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1,
        xxl: 1
      }}
      dataSource={list}
      loading={loading}
      renderItem={item => <List.Item>
           <Card
          bordered={false}
          hoverable
          title={<Title>{item.title}</Title>}
          bodyStyle={{ paddingTop: 16 }}
          onClick={() => props.history.push(`/resources/${item.id}`)}
          extra={<Button icon={<Icon component={() => <MdOpenInNew />} />} type="link" href={`/resources/${item.id}`} target="_blank" />}
        >
          <Paragraph>{item.brief}...</Paragraph>
          <Text type="secondary">
        <small>
          <TimeAgo value={item.publishedAt} showTime={false} prefix="Published:" direction="horizontal" />
        </small>
      </Text>
        </Card>       

      </List.Item>}
    />
  </Container>
});

ResourceListPage.propTypes = {};

ResourceListPage.defaultProps = {};

export default withRouter(ResourceListPage);
