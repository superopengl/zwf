import { Button, Typography, List, Card, Image, Space, Row } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import styled from 'styled-components';
import {useNavigate } from 'react-router-dom';
import { finalize } from 'rxjs/operators';
import { listPublishedResourcePages$ } from 'services/resourcePageService';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
const { Text, Paragraph, Title, Link: TextLink } = Typography;

const Container = styled.div`
  margin: 48px auto 120px auto;
  padding: 3rem 1rem;
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
          title={null}
          bodyStyle={{ paddingTop: 16 }}
          onClick={() => navigate(`/resource/${item.id}`)}
        >
          <Space direction="vertical">
            <Space style={{ justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <Title style={{marginBottom: 0}}>{item.title}</Title>
              <Button icon={<Icon component={MdOpenInNew } />} type="link" href={`/resource/${item.id}`} target="_blank" onClick={e => e.stopPropagation()} />
            </Space>
            <Text type="secondary">
              <small>
                <TimeAgo value={item.publishedAt} showTime={false} prefix="Published:" direction="horizontal" />
              </small>
            </Text>
            <Space style={{ alignItems: 'flex-start' }} size="large">
              {item.imageBase64 && <Image src={item.imageBase64} alt="picture" preview={false} width={200} />}
              <Paragraph style={{ lineBreak: 'anywhere' }}>{item.brief}...</Paragraph>
            </Space>
          </Space>

        </Card>

      </List.Item>}
    />
  </Container>
});

ResourceListPage.propTypes = {};

ResourceListPage.defaultProps = {};

export default ResourceListPage;
