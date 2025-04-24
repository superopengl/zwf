import { Row, Col } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { TimeAgo } from './TimeAgo';
import { UserNameCard } from './UserNameCard';
import ScrollToBottom, { } from 'react-scroll-to-bottom';
import { listTaskComment$, } from 'services/taskService';
import * as moment from 'moment';
import { css } from '@emotion/css'
import { ProList } from '@ant-design/pro-components';
import styled from 'styled-components';
import { TaskCommentInputForm } from './TaskCommentInputForm';
import { useAuthUser } from 'hooks/useAuthUser';
import { useZevent } from 'hooks/useZevent';
import { ackTaskEventType$ } from 'services/notificationService';
import { finalize, switchMap, tap } from 'rxjs';

const StyledList = styled(ProList)`
.ant-pro-card-body {
  padding: 0;
  overflow-x: hidden;

  .ant-list-item {
    padding: 3px 24px;
    border: 0;

    .ant-list-item-meta-title {
      margin-bottom: 4px;
    }

    .ant-pro-list-row-subTitle {
      font-weight: 400;
    }

    .ant-list-item-meta-description {
      color: #2C3645;
    }
  }
}

max-width: 700px;
width: 100%;

.ant-list-empty-text {
  display: none;
}
`

const containerCss = css({
  height: '100%',
  width: '100%',
  '& button': {
    // display: 'none',
  }
});

const IconText = ({ icon, text }) => (
  <span>
    {React.createElement(icon, { style: { marginInlineEnd: 8 } })}
    {text}
  </span>
);

export const TaskCommentDisplayPanel = React.memo((props) => {
  const { taskId } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [user] = useAuthUser();

  const myUserId = user?.id;
  const isMe = (userId) => userId === myUserId;

  // React.useEffect(() => {
  //   scrollToBottom();
  // }, [list]);

  const handleZevent = z => {
    const event = z.payload;
    event.createdAt = moment.utc(event.createdAt).local().toDate();
    setList(list => [...list, event]);
  };

  const filterZevent = z => {
    return z.type === 'taskEvent' &&
      z.payload.taskId === taskId &&
      z.payload.type === 'comment';
  }

  useZevent(filterZevent, handleZevent);

  React.useEffect(() => {
    const sub$ = listTaskComment$(taskId)
      .pipe(
        tap(setList),
        switchMap(() => ackTaskEventType$(taskId, 'comment')),
        finalize(() => setLoading(false)),
      )
      .subscribe();



    return () => sub$.unsubscribe();
  }, []);

  return <ScrollToBottom className={containerCss} debug={false}>
    <StyledList
      split={false}
      rowKey="id"
      loading={loading}
      itemLayout="vertical"
      // footer={<Row gutter={16} style={{padding: '0 24px'}}>
      //   <Col>
      //     <UserNameCard size={32} userId={myUserId} showName={false} showEmail={false} showTooltip={true} />
      //   </Col>
      //   <Col flex="auto" >
      //     <TaskCommentInputForm taskId={taskId} />
      //   </Col>
      // </Row>}
      dataSource={list.map(item => ({
        avatar: <UserNameCard size={32} userId={item.by} showName={false} showEmail={false} showTooltip={true} />,
        title: isMe(item.by) ? "Me" : <UserNameCard userId={item.by} showName={true} showAvatar={false} showEmail={false} showTooltip={true} />,
        subTitle: <small><TimeAgo type="secondary" value={item.createdAt} showTime={false} /></small>,
        description: item.info.message,
      }))}
      locale={{ emptyText: <></> }}
      metas={{
        avatar: {},
        title: {},
        description: {},
        subTitle: {},
      }}
    />
  </ScrollToBottom >
});

TaskCommentDisplayPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskCommentDisplayPanel.defaultProps = {
};

