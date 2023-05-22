import PropTypes from 'prop-types';
import { Drawer, Card, Button, Tag, Typography } from 'antd';
import React from 'react';
import Icon, { CloseCircleFilled, RightOutlined } from '@ant-design/icons';
import { ackTaskEventType$, loadMyUnackZevents$, } from 'services/zeventService';
import { Badge } from 'antd';
import { List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TaskIcon } from './entityIcon';
import { useZevent } from 'hooks/useZevent';
import { useAuthUser } from 'hooks/useAuthUser';
import { UserNameCard } from 'components/UserNameCard';
import { TimeAgo } from 'components/TimeAgo';
import { ZeventContext } from 'contexts/ZeventContext';
import { IoNotificationsOutline } from 'react-icons/io5';

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
  const { supportOpen } = props;
  const [list, setList] = React.useState([]);
  const [unreadSupportMsgCount, setUnreadSupportMsgCount] = React.useState(0);
  const [user] = useAuthUser();
  const { zevents, setZevents } = React.useContext(ZeventContext);
  const [open, setOpen] = React.useState(false)

  // const { notifications, setNotifications } = context;

  const navigate = useNavigate();

  /**
   * Initial load
   */

  const load$ = () => {
    return loadMyUnackZevents$()
      .pipe()
      .subscribe(setZevents);
  }

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe();
  }, []);

  /**
   * Zevent source
   */
  const filterZevent = React.useCallback(() => true, []);

  const handleZevent = React.useCallback(z => {
    const { type } = z;
    switch (type) {
      case 'taskEvent':
        setZevents(pre => [...pre, z])
        break;
      case 'taskEvent.ack':
        // setZevents(pre => pre.filter(z => z.payload.eventId !== payload.eventId));
        break;
      case 'support':
        break;
      default:
        break;
    }
  }, []);

  useZevent(filterZevent, handleZevent, [user]);


  React.useEffect(() => {
    if (supportOpen) {
      setUnreadSupportMsgCount(0);
    }
  }, [supportOpen]);

  // const handleZeventTaskEvent = z => {
  //   const taskEvent = z.payload;
  //   setList([...list, taskEvent]);
  //   const existing = list.find(x => x.taskId = taskEvent.taskId && x.type === taskEvent.type);
  //   if (existing) {
  //     existing.createdAt = taskEvent.createdAt;
  //     setList([...list]);
  //   } else {
  //     setList(list => [taskEvent, ...list]);
  //   }
  // }

  // useZevent(z => {
  //   return z.payload.by !== userId;
  // }, z => {
  //   if (z.type === 'support') {
  //     if (!supportOpen) {
  //       setUnreadSupportMsgCount(pre => pre + 1)
  //     }
  //   } else if (z.type === 'taskEvent') {
  //     handleZeventTaskEvent(z);
  //   } else {
  //     const exists = changedTasks.some((t => t.taskId === z.taskId));
  //     if (!exists) {
  //       setChangedTasks(pre => [...pre, {
  //         taskId: z.taskId,
  //         taskName: z.taskName,
  //       }])
  //     }
  //   }
  // }, [supportOpen]);


  // const items = [];
  // list.forEach((x, i) => {
  //   const item = {
  //     key: i,
  //     // icon: <Icon component={MdDashboard} />,
  //     icon: <TaskIcon size={14} />,
  //     label: <StyledCompactSpace direction='vertical'>
  //       <Text strong>{x.payload.taskName}</Text>
  //       <Text strong={!x.payload.ackAt}>{getNotificationMessage(x)}</Text>
  //       <TimeAgo strong={!x.payload.ackAt} value={x.payload.createdAt} direction="horizontal" />
  //     </StyledCompactSpace>,
  //     onClick: () => handleItemClick(x),
  //   };

  //   if (i !== 0) {
  //     items.push({
  //       type: 'divider'
  //     });
  //   }
  //   items.push(item);
  // })

  // if (unreadSupportMsgCount) {
  //   items.unshift({
  //     key: 'support',
  //     icon: <Text style={{ fontSize: 24, color: '#0FBFC4' }}><CommentOutlined /></Text>,
  //     label: <>Unread support message <Badge count={unreadSupportMsgCount} /></>,
  //     onClick: () => {
  //       onSupportOpen()
  //       setUnreadSupportMsgCount(0)
  //     },
  //   })
  // }

  // if (!items.length) {
  //   items.push({
  //     label: <Text type="secondary">No notifications</Text>
  //   })
  // }

  const handleClick = () => {
    load$();
    setOpen(true)
  }

  const handleNotificationClick = (z) => {
    const { payload: { taskId, type } } = z;
    navigate(`/task/${taskId}`, { state: { type } });
    ackTaskEventType$(taskId, type).subscribe({
      // next: () => setOpen(false),
      error: () => { /** Swallow error */ },
    });
  }

  return <Badge showZero={false} count={zevents.filter(x => !x.payload.ackAt).length} offset={[-4, 6]}>
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
  onSupportOpen: PropTypes.func,
  supportOpen: PropTypes.bool,
};

NotificationButton.defaultProps = {
  onSupportOpen: () => { },
};