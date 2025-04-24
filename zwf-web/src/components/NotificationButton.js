import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Drawer, Card, Form, Collapse, Row, Button, Tag, Typography, Space, Dropdown } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import Icon, { BellOutlined, CommentOutlined, RightOutlined } from '@ant-design/icons';
import { CloseOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { OptionsBuilder } from '../pages/Femplate/formBuilder/OptionsBuilder';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { ackTaskEventType$, getMyNotifications$, } from 'services/notificationService';
import { Badge } from 'antd';
import { List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TaskIcon } from './entityIcon';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import { FaTasks } from 'react-icons/fa';
import { MdDashboard, MdOpenInNew } from 'react-icons/md';
import styled from 'styled-components';
import { useZevent } from 'hooks/useZevent';
import { useAuthUser } from 'hooks/useAuthUser';
import { useSupportChatWidget } from 'hooks/useSupportChatWidget';
import { UserNameCard } from 'components/UserNameCard';
import { TimeAgo } from 'components/TimeAgo';
import { GlobalContext } from 'contexts/GlobalContext';
import { NotificationContext } from 'contexts/NotificationContext';
import { groupBy, orderBy, sortBy } from 'lodash';
import { IoNotificationsOutline } from 'react-icons/io5';

const { Text, Title, Paragraph, Link: TextLink } = Typography;

const StyledCompactSpace = styled(Space)`
gap: 0 !important;
width: '100%;
`;

const Container = styled.div`
.ant-menu-item {
  height: auto !important;
}
`

const messageFuncMap = {
  'client-submit': x => <>Submitted by client</>,
  'client-sign-doc': x => <>Documents were signed by client</>,
  'comment': x => <>Has new comments</>,
  'created-recurringly': x => <>Was created automatically by recurring</>,
  'start-proceeding': x => <>Started being proceeded</>,
  'assign': x => <>Was assigned to <UserNameCard userId={x.payload.info.assigneeId} showEmail={false} /></>,
  'complete': x => <>Was completed</>,
  'archive': x => <>Was archieved</>,
  'request-client-sign': x => <>Documents requires sign</>,
  'request-client-fields': x => <>Form fields require to be filled</>,
};

const getNotificationMessage = x => {
  const { payload: { type } } = x;
  const func = messageFuncMap[type] ?? (x => <>Task has an event <Tag>{type}</Tag></>);
  return func(x);
}


export const NotificationButton = (props) => {
  const { supportOpen, onSupportOpen } = props;
  const [list, setList] = React.useState([]);
  const [unreadSupportMsgCount, setUnreadSupportMsgCount] = React.useState(0);
  const [user] = useAuthUser();
  const { zevents, setZevents } = React.useContext(NotificationContext);
  const [open, setOpen] = React.useState(false)

  // const { notifications, setNotifications } = context;

  const userId = user.id;

  const navigate = useNavigate();

  /**
   * Initial load
   */

  const load$ = () => {
    return getMyNotifications$()
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
    const { type, payload } = z;
    switch (type) {
      case 'taskEvent':
        setZevents(pre => [...pre, z])
        break;
      case 'taskEvent.ack':
        debugger;
        // setZevents(pre => pre.filter(z => z.payload.eventId !== payload.eventId));
        break;
      case 'support':
        break;
      default:
        break;
    }
  }, []);

  useZevent(filterZevent, handleZevent, [user]);

  const getItem = (label, key, icon, children, type) => {
    return {
      key,
      icon,
      children,
      label,
      type,
    };
  }

  const items = React.useMemo(() => {
    const taskGropus = groupBy(zevents, z => `${z.payload.taskId}`);
    const menuItems = Object.values(taskGropus).map(taskEvents => {
      // const first = orderBy(taskEvents, t => Date.parse(t.payload.createdAt), ['desc'])[0];
      const first = taskEvents[0];

      debugger;
      return <Collapse.Panel
        key={first.payload.taskId}
        extra={<Icon component={MdOpenInNew} onClick={() => navigate(`/task/${first.payload.taskId}`)} />}
        header={<Space style={{ width: '100%', justifyContent: 'space-between', paddingRight: 10 }}>
          <Row style={{ maxWidth: 240 }} wrap={false}>
            <TaskIcon size={14} />
            <Text ellipsis={true}>{first.payload.taskName}</Text>
          </Row>
          <Badge showZero={false} count={taskEvents.filter(z => !z.payload.ackAt).length} />
        </Space>}
      >
        {/* {taskEvents.map(z => <div key={z.payload.eventId} onClick={() => handleItemClick(z)}>
          <Text strong={!z.payload.ackAt}>{getNotificationMessage(z)}</Text>
          <TimeAgo strong={!z.payload.ackAt} value={z.payload.createdAt} direction="horizontal" />
        </div>)} */}
        {/* {taskEvents.map(z => <ProCard key={z.payload.eventId} onClick={() => handleItemClick(z)} size="small"
          style={{marginLeft: 20}}
          bordered={true}
          // title={getNotificationMessage(z)}
          // subTitle={<TimeAgo value={z.payload.createdAt} direction="horizontal" showTime={false} />}
        >
          <Text strong={!z.payload.ackAt}>{getNotificationMessage(z)}</Text>
          <TimeAgo value={z.payload.createdAt} direction="horizontal" showTime={false} />
        </ProCard>)} */}
        <List
          dataSource={taskEvents}
          style={{ marginLeft: 20 }}
          size="small"
          renderItem={z => <List.Item>
            <List.Item.Meta
              title={getNotificationMessage(z)}
              description={<TimeAgo value={z.payload.createdAt} direction="horizontal" showTime={false} />}
            />
          </List.Item>}
        />
      </Collapse.Panel>

      // return {
      //   key: first.payload.taskId,
      //   // icon: <Icon component={MdDashboard} />,
      //   icon: null,
      //   label: <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      //     <Row style={{ maxWidth: 240 }} wrap={false}>
      //       <TaskIcon size={14} />
      //       <Text ellipsis={true}>{first.payload.taskName}</Text>
      //     </Row>
      //     <Badge showZero={false} count={taskEvents.filter(z => !z.payload.ackAt).length} />
      //   </Space>,
      //   children: taskEvents.map(z => ({
      //     key: z.payload.id,
      //     label: <StyledCompactSpace direction='vertical'>
      //       <Text strong={!z.payload.ackAt}>{getNotificationMessage(z)}</Text>
      //       <TimeAgo strong={!z.payload.ackAt} value={z.payload.createdAt} direction="horizontal" />
      //     </StyledCompactSpace>,
      //     onClick: () => handleItemClick(z)
      //   }))
      // }
    })
    return menuItems;
  }, [zevents]);

  debugger;

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

  const handleItemClick = (item) => {
    const { payload: { taskId, type } } = item;
    navigate(`/task/${taskId}`, { state: { type } });
    ackTaskEventType$(taskId, type).subscribe({
      // next: () => load$(),
      error: () => { /** Swallow error */ },
    });
  }

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
      next: () => setOpen(false),
      error: () => { /** Swallow error */ },
    });
  }

  return <Container>
    <Badge showZero={false} count={zevents.filter(x => !x.payload.ackAt).length} offset={[-4, 6]}>
      <Button icon={<Icon component={IoNotificationsOutline} />} shape="circle" type="text" size="large" onClick={handleClick} />
      {/* <DebugJsonPanel value={notifications} /> */}
    </Badge>
    <Drawer
      open={open}
      onClose={() => setOpen(false)}
      title="Notifications"
      rootClassName='zwf-notification'
      mask={true}
      header={false}
      maskStyle={{ background: 'rgba(0, 0, 0, 0)' }}
    // bodyStyle={{ padding: 0 }}
    // headerStyle={{background: 'transparent'}}
    >
      {/* <Collapse bordered={false} expandIconPosition="end">
        {items}
      </Collapse> */}
      <List
        dataSource={zevents}
        grid={{ gutter: 0, column: 1 }}
        size="small"
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
  </Container>

  return <Dropdown trigger={['click']} menu={{
    items,
    mode: "vertical",
    inlineCollapsed: false,
  }}
    overlayClassName="notification-dropdown" arrow={true}>
    <Badge showZero={false} count={zevents.filter(x => !x.payload.ackAt).length} offset={[-4, 6]}>
      <Button icon={<Icon component={IoNotificationsOutline} />} shape="circle" type="text" size="large" onClick={handleClick} />
      {/* <DebugJsonPanel value={notifications} /> */}
    </Badge>
  </Dropdown>
};


NotificationButton.propTypes = {
  onSupportOpen: PropTypes.func,
  supportOpen: PropTypes.bool,
};

NotificationButton.defaultProps = {
  onSupportOpen: () => { },
};