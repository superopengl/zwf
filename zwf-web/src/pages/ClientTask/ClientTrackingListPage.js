import { SyncOutlined } from '@ant-design/icons';
import { Button, Row, Typography, Grid, message, Card } from 'antd';
import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import styled from 'styled-components';
import { finalize } from 'rxjs/operators';
import { searchMyTaskTracking$ } from 'services/taskTrackingService';
import { TaskTrackingTimeline } from 'components/TaskTrackingTimeline';
import ScrollToBottom, { useScrollToBottom } from 'react-scroll-to-bottom';
import { css } from '@emotion/css'
import { useAssertRole } from 'hooks/useAssertRole';

const { Title, Paragraph, Link: TextLink } = Typography;
const { useBreakpoint } = Grid;


const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
  max-width: 1500px;

  .ant-tabs-tab-btn {
    width: 100%;
  }

  // .ant-tabs-tab {
  //   margin: 0 !important;
  // }
  .ant-page-header-heading {
    padding: 0 0 24px 24px;
  }

  .ant-page-header-heading {
    padding-left: 0;
  }

  .ant-timeline-item:hover {
    .activity-title {
      position: relative;

      &::after {
        content: 'go to task >';
        position: absolute;
        color: #0FBFC4;
        top: 0;
        right: 0;
      }
    }
  }

`;

const containerCss = css({
  overflowY: 'visible',
  height: 'calc(100vh - 320px)',
  width: '100%',
  '& button:not(.show-button)': {
    display: 'none',
  }
});

export const ClientTrackingListPage = () => {
  useAssertRole(['client']);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [list, setList] = React.useState([]);
  const scrollToBottom = useScrollToBottom();

  const load$ = () => {
    setLoading(true);
    return searchMyTaskTracking$(page)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(data => {
        if (data.length) {
          setList(list => [...(data.reverse()), ...list]);
        } else {
          message.info({
            key: 'no-more-activities',
            content: 'No more activities. All activities as of now have been loaded.'
          })
        }
        setLoading(false);
      });
  }

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe()
  }, [page]);


  return (
    <LayoutStyled>
      <PageContainer
        loading={loading}
        header={{
          title: 'Interactions & Messages',
        }}
      >
        <Paragraph>
          This page shows all the activities in time series cross all your cases from all our agents. You can click on individual case to see the case specific activities.
        </Paragraph>
        <Card
          size="small"
          bodyStyle={{ padding: 0 }}
          title={<><Row justify="center">
            <Button key="more"
              icon={<SyncOutlined />}
              disabled={loading}
              onClick={() => setPage(x => x + 1)}
              type="link">{loading ? 'Loading...' : `Load more past activities (${list.length} loaded)`}</Button>
          </Row>
          </>}
        >
          <ScrollToBottom className={containerCss} debug={false}>
            <TaskTrackingTimeline dataSource={list} mode="multi" />
          </ScrollToBottom >
        </Card>
      </PageContainer>
    </LayoutStyled>
  )
}

ClientTrackingListPage.propTypes = {};

ClientTrackingListPage.defaultProps = {};

export default ClientTrackingListPage;
