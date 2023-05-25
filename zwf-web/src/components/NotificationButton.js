import PropTypes from 'prop-types';
import { Drawer, Card, Button, Tag, Typography } from 'antd';
import React from 'react';
import Icon, { CloseCircleFilled, RightOutlined } from '@ant-design/icons';
import { ackTaskEventType$, loadMyUnackZevents$, } from 'services/zeventService';
import { Badge } from 'antd';
import { List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TaskIcon } from './entityIcon';
import { useAuthUser } from 'hooks/useAuthUser';
import { UserNameCard } from 'components/UserNameCard';
import { TimeAgo } from 'components/TimeAgo';
import { ZeventContext } from 'contexts/ZeventContext';
import { IoNotificationsOutline } from 'react-icons/io5';
import { DebugJsonPanel } from 'components/DebugJsonPanel';

const { Text } = Typography;


const messageFuncMap = {
  'client-submit-form': () => <>Submitted by client</>,
  'client-sign-doc': () => <>Documents were signed by client</>,
  'task-comment': () => <>Has new comments</>,
  'created-recurringly': () => <>Was created automatically by recurring</>,
  'assign': x => <>Was assigned to <UserNameCard userId={x.payload.info.assigneeId} showEmail={false} /></>,
  'complete': () => <>Was completed</>,
  'archive': () => <>Was archieved</>,
  'request-client-sign': () => <>Documents requires sign</>,
  'request-client-fill-form': () => <>Form fields require to be filled</>,
};

const getNotificationMessage = x => {
  const { payload: { type } } = x;
  const func = messageFuncMap[type] ?? (() => <>Task has an event <Tag>{type}</Tag></>);
  return func(x);
}


export const NotificationButton = (props) => {
  const { zevents, reloadZevents$ } = React.useContext(ZeventContext);
  const [open, setOpen] = React.useState(false)

  // const { notifications, setNotifications } = context;

  const navigate = useNavigate();


  const handleClick = () => {
    reloadZevents$().add(() => setOpen(true));
  }

  const handleNotificationClick = (z) => {
    const { payload: { taskId, type } } = z;
    navigate(`/task/${taskId}`, { state: { type } });
    ackTaskEventType$(taskId, type).subscribe({
      // next: () => setOpen(false),
      error: () => { /** Swallow error */ },
    });
  }

  return <Badge showZero={false} count={zevents.length} offset={[-4, 6]}>
    <Button icon={<Icon component={IoNotificationsOutline} />} shape="circle" type="text" size="large" onClick={handleClick} />
    {/* <DebugJsonPanel value={notifications} /> */}
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title={null}
      closeIcon={<CloseCircleFilled />}
      rootClassName='zwf-notification'
      maskClosable={true}
      destroyOnClose={true}
      // maskStyle={{ background: 'rgba(0, 0, 0, 0)' }}
      bodyStyle={{ padding: '0 8px' }}
      onClick={() => setOpen(false)}
    >
      {/* <DebugJsonPanel value={zevents} /> */}
      <List
        onClick={() => setOpen(false)}
        dataSource={zevents}
        grid={{ gutter: 0, column: 1 }}
        size="small"
        locale={{ emptyText: <Card size="small">No notifications</Card> }}
        renderItem={z => <List.Item style={{ padding: 0 }}>
          <Card
            title={<><TaskIcon /> {z.payload.taskName}</>}
            size="small"
            hoverable
            onClick={() => handleNotificationClick(z)}
            extra={<Text type="secondary"><RightOutlined /></Text>}
          >
            {getNotificationMessage(z)}
            <br />
            <TimeAgo value={z.payload.createdAt} direction="horizontal" showTime={true} />
          </Card>
        </List.Item>}
      />
    </Drawer>
  </Badge>
};


NotificationButton.propTypes = {
  supportOpen: PropTypes.bool,
};

NotificationButton.defaultProps = {
};