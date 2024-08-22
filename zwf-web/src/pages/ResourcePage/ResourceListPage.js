import { Button, Typography, List, Card, Image, Col, Row, Skeleton } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { finalize } from 'rxjs/operators';
import { listPublishedResourcePages$ } from 'services/resourcePageService';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { MdOpenInNew } from 'react-icons/md';
import Icon from '@ant-design/icons';
import { Tag } from 'antd';
const { Text, Paragraph, Title, Link: TextLink } = Typography;

const Container = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 3rem 1rem;
  
  .ant-row {
    margin-top: 24px;
  }

  .ant-card {
    box-shadow: 0px 0px 16px rgba(0, 26, 31, 0.08);
    border-radius: 8px;
    &:hover {
      background-color: #0FBFC411;
      transform: scale(1.03);
      transition: all 0.05s ease-in-out; 
    }
  }

  .ant-tag {
    font-size:12px;
    color: #F77234;
    background-color: #F7723433;
    border: none;
  }

  .ant-skeleton {
    width: 100%;
  }

  .image-skeleton-container {
    height: 200px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(190, 190, 190, 0.2);

    .ant-skeleton-image {
      width: auto;
      background: none;
    }
  }

`;

const SkeletonCard = () => {
  return <Card style={{ height: 430 }}>
    <div className='image-skeleton-container'>
      <Skeleton.Image active={true} />
    </div>
    <Skeleton active={true} />
  </Card>
}

const placeholderList = new Array(6).fill(<SkeletonCard />);

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

  const shouldShowSkelenton = loading && list.length === 0;

  return <Container justify='center'>
    {/* <Title>Resource Library</Title> */}
    <Row justify="center" style={{ padding: '0 16px' }}>
      <Image src="/images/resource-list-poster.svg" alt="Resource list page poster" preview={false} />
    </Row>
    <Row>
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
        dataSource={shouldShowSkelenton ? placeholderList : list}
        style={{ width: '100%' }}
        loading={loading}
        renderItem={item => <List.Item>
          {shouldShowSkelenton ? <SkeletonCard /> : <Card
            bordered={false}
            hoverable
            title={null}
            onClick={() => navigate(`/resource/${item.titleKey}`)}
            style={{ height: 430 }}
          >
            <div
              style={{
                width: '100%',
                height: 200,
                backgroundImage: `url("${item.imageBase64}")`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                borderRadius: 4,
                // marginBottom: 16,
              }}
            ></div>
            <Row justify="space-between" style={{ marginTop: 12 }}>
              <Text type="secondary">
                <small>
                  <TimeAgo value={item.publishedAt} showTime={false} direction="horizontal" />
                </small>
              </Text>
              <Text>
                <Tag>Featured</Tag>
              </Text>
            </Row>
            <Title level={3} style={{ fontSize: 16, marginTop: 12 }} ellipsis={{ rows: 2 }}>{item.title}</Title>
            <Paragraph ellipsis={{ rows: 4 }}>{item.brief}</Paragraph>
          </Card>}
        </List.Item>}
      />
    </Row>
  </Container>
});

ResourceListPage.propTypes = {};

ResourceListPage.defaultProps = {};

export default ResourceListPage;
