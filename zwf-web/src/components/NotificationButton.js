import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Avatar, Tooltip, Form, Switch, Input, Button, Drawer, Typography, Space, Dropdown } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import Icon, { BellOutlined, CommentOutlined, RightOutlined } from '@ant-design/icons';
import { CloseOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { OptionsBuilder } from '../pages/Femplate/formBuilder/OptionsBuilder';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { getMyNotifications$, } from 'services/notificationMessageService';
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

const { Text, Title, Paragraph, Link } = Typography;

const StyledList = styled(List)`
.ant-list-item {
  &:hover {
    cursor: pointer;
  }
}
`;

const messageFuncMap = {
  'client-submit': x => <>Task {x.taskName} was submitted by client</>,
  'client-sign-doc': x => <>Document {x.info.docName} of task {x.taskName} was signed by client</>,
  'comment': x => <>Task {x.taskName} has new comments</>,
  'create-by-recurring': x => <>Task {x.taskName} was created automatically by recurring</>,
  'start-proceeding': x => <>Task {x.taskName} started being proceeded</>,
  'assign': x => <>Task {x.taskName} was assigned to <UserNameCard userId={x.info.assigneeId} /></>,
  'complete': x => <>Task {x.taskName} was completed</>,
  'archive': x => <>Task {x.taskName} was archieved</>,
  'request-client-sign': x => <>Documents of task {x.taskName} requires sign</>,
  'request-client-fields': x => <>Form of task {x.taskName} requires to be filled</>,
};

const getNotificationMessage = notification => {
  const { type } = notification;
  const func = messageFuncMap[type] ?? (x => <>Task {x.taskName} {type}</>);
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

  const items = list.map((x, i) => ({
    key: i,
    // icon: <Icon component={MdDashboard} />,
    icon: <TaskIcon size={14} />,
    label: <Space direction='vertical'>
      <Text>{getNotificationMessage(x)}</Text>
      <TimeAgo value={x.eventAt} direction="horizontal"/>
    </Space>,
    onClick: () => navigate(`/task/${x.taskId}`),
  }))

  if (unreadSupportMsgCount) {
    if (changedTasks.length > 0) {
      items.unshift({
        type: 'divider',
      })
    }
    items.unshift({
      key: 'support',
      icon: <Text style={{ fontSize: 24, color: '#0FBFC4' }}><CommentOutlined /></Text>,
      label: <>Unread support message <Badge count={unreadSupportMsgCount} /></>,
      onClick: () => {
        onSupportOpen()
        setUnreadSupportMsgCount(0)
      },
    })
  }

  if (!items.length) {
    items.push({
      label: <Text type="secondary">No notifications</Text>
    })
  }

  return <Dropdown trigger={['click']} menu={{ items }}>
    <Badge showZero={false} count={list.length} offset={[-4, 6]}>
      <Button icon={<BellOutlined />} shape="circle" type="text" size="large" onClick={() => load$()} />
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