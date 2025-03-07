import { Row, Col } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { TimeAgo } from './TimeAgo';
import { UserNameCard } from './UserNameCard';
import ScrollToBottom, { } from 'react-scroll-to-bottom';
import { listTaskComment$, } from 'services/taskService';
import { nudgeCommentAccess$ } from 'services/taskCommentService';
import * as moment from 'moment';
import { css } from '@emotion/css'
import { ProList } from '@ant-design/pro-components';
import styled from 'styled-components';
import { TaskMessageForm } from './TaskMessageForm';
import { useAuthUser } from 'hooks/useAuthUser';
import { useSubscribeZevent } from 'hooks/useSubscribeZevent';

const StyledList = styled(ProList)`
.ant-pro-card-body {
  padding: 0;

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
    border: 0;

    .ant-pro-list-row-subTitle {
      font-weight: 400;
    }

    .ant-list-item-meta-description {
      color: #2C3645;
    }
  }
}

.ant-list-empty-text {
  display: none;
}
`

const containerCss = css({
  height: '100%',
  width: '100%',
  '& button': {
    display: 'none',
  }
});

const IconText = ({ icon, text }) => (
  <span>
    {React.createElement(icon, { style: { marginInlineEnd: 8 } })}
    {text}
  </span>
);

export const TaskCommentPanel = React.memo((props) => {
  const { taskId } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [user] = useAuthUser();

  const myUserId = user?.id;
  const isMe = (userId) => userId === myUserId;

  // React.useEffect(() => {
  //   scrollToBottom();
  // }, [list]);

  const handleZevent = zevent => {
    const event = zevent.payload;
    event.createdAt = moment.utc(event.createdAt).local().toDate();
    setList(list => [...list, event]);
    nudgeCommentAccess$(taskId).subscribe();
  };

  useSubscribeZevent('task.comment', handleZevent);

  React.useEffect(() => {
    const sub$ = listTaskComment$(taskId).subscribe(allData => {
      allData.forEach(x => {
        x.createdAt = moment.utc(x.createdAt).local().toDate()
      });
      setList(allData);
      setLoading(false);
    });

    return () => sub$.unsubscribe();
  }, []);

  return <ScrollToBottom className={containerCss} debug={false}>
    <StyledList
      split={false}
      rowKey="id"
      itemLayout="vertical"
      footer={<Row gutter={16}>
        <Col>
          <UserNameCard size={40} userId={myUserId} showName={false} showEmail={false} showTooltip={true} />
        </Col>
        <Col flex="auto">
          <TaskMessageForm taskId={taskId} />
        </Col>
      </Row>}
      dataSource={list.map(item => ({
        avatar: <UserNameCard size={40} userId={item.by} showName={false} showEmail={false} showTooltip={true} />,
        title: isMe(item.by) ? "Me" : <UserNameCard userId={item.by} showName={true} showAvatar={false} showEmail={false} showTooltip={false} />,
        subTitle: <TimeAgo value={item.createdAt} showTime={false} />,
        description: item.info,
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

TaskCommentPanel.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskCommentPanel.defaultProps = {
};

