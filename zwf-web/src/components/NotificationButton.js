import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Avatar, Tooltip, Form, Switch, Row, Button, Drawer, Typography, Space, Dropdown } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import Icon, { BellOutlined, CommentOutlined, RightOutlined } from '@ant-design/icons';
import { CloseOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { OptionsBuilder } from '../pages/Femplate/formBuilder/OptionsBuilder';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { ackTaskEventNotification$, getMyNotifications$, } from 'services/notificationService';
import { Badge } from 'antd';
import { List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { TaskIcon } from './entityIcon';
import { HiOutlineChatAlt2 } from 'react-icons/hi';
import { FaTasks } from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import styled from 'styled-components';
import { useZevent } from 'hooks/useZevent';
import { useAuthUser } from 'hooks/useAuthUser';
import { useSupportChatWidget } from 'hooks/useSupportChatWidget';
import { UserNameCard } from 'components/UserNameCard';
import { TimeAgo } from 'components/TimeAgo';

const { Text, Title, Paragraph, Link: TextLink } = Typography;

const StyledCompactSpace = styled(Space)`
gap: 0 !important;
width: '100%;
`;

const messageFuncMap = {
  'client-submit': x => <>Submitted by client</>,
  'client-sign-doc': x => <>Documents were signed by client</>,
  'comment': x => <>Has new comments</>,
  'create-by-recurring': x => <>Was created automatically by recurring</>,
  'start-proceeding': x => <>Started being proceeded</>,
  'assign': x => <>Was assigned to <UserNameCard userId={x.info.assigneeId} /></>,
  'complete': x => <>Was completed</>,
  'archive': x => <>Was archieved</>,
  'request-client-sign': x => <>Documents requires sign</>,
  'request-client-fields': x => <>Form fields require to be filled</>,
};

const getNotificationMessage = notification => {
  const { type } = notification;
  const func = messageFuncMap[type] ?? (x => <>Task has an event of {type}</>);
  return func(notification);
}


export const NotificationButton = (props) => {
  const { supportOpen, onSupportOpen } = props;
  const [changedTasks, setChangedTasks] = React.useState([]);
  const [list, setList] = React.useState([]);
  const [unreadSupportMsgCount, setUnreadSupportMsgCount] = React.useState(0);
  const [user] = useAuthUser();

  const userId = user.id;

  const navigate = useNavigate();

  const load$ = () => {
    return getMyNotifications$()
      .pipe()
      .subscribe(setList);
    // .subscribe(result => {
    //   setChangedTasks(result.changedTasks);
    //   setUnreadSupportMsgCount(result.unreadSupportMsgCount);
    // });
  }

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe();
  }, [])

  React.useEffect(() => {
    if (supportOpen) {
      setUnreadSupportMsgCount(0);
    }
  }, [supportOpen]);

  useZevent(z => z.by !== userId, z => {
    if (z.type === 'support') {
      if (!supportOpen) {
        setUnreadSupportMsgCount(pre => pre + 1)
      }
    } else {
      const exists = changedTasks.some((t => t.taskId === z.taskId));
      if (!exists) {
        setChangedTasks(pre => [...pre, {
          taskId: z.taskId,
          taskName: z.taskName,
        }])
      }
    }
  }, [supportOpen]);

  const handleItemClick = (item) => {
    const { taskId, type } = item;

    item.clicked = true;
    setList([...list]);
    navigate(`/task/${taskId}`, { state: { type } });
    ackTaskEventNotification$(taskId, type).subscribe({
      // next: () => load$(),
      error: () => { /** Swallow error */ },
    });
  }

  const items = [];
  list.forEach((x, i) => {
    const item = {
      key: i,
      // icon: <Icon component={MdDashboard} />,
      icon: <TaskIcon size={14} />,
      label: <StyledCompactSpace direction='vertical'>
        <Text strong>{x.taskName}</Text>
        <Text strong={!x.ackAt}>{getNotificationMessage(x)}</Text>
        <TimeAgo strong={!x.ackAt} value={x.eventAt} direction="horizontal" />
      </StyledCompactSpace>,
      onClick: () => handleItemClick(x),
    };

    if (i !== 0) {
      items.push({
        type: 'divider'
      });
    }
    items.push(item);
  })

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

  if (!items.length) {
    items.push({
      label: <Text type="secondary">No notifications</Text>
    })
  }

  const handleClick = () => {
    load$();
  }

  return <Dropdown trigger={['click']} menu={{ items }} overlayClassName="notification-dropdown" arrow={true}>
    <Badge showZero={false} count={list.filter(x => !x.ackAt).length} offset={[-4, 6]}>
      <Button icon={<BellOutlined />} shape="circle" type="text" size="large" onClick={handleClick} />
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