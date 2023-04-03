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
import { OptionsBuilder } from '../pages/TaskTemplate/formBuilder/OptionsBuilder';
import DocTemplateSelect from 'components/DocTemplateSelect';
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

const { Text, Title, Paragraph, Link } = Typography;

const StyledList = styled(List)`
.ant-list-item {
  &:hover {
    cursor: pointer;
  }
}
`;


export const NotificationButton = (props) => {
  const { supportOpen, onSupportOpen } = props;
  const [changedTasks, setChangedTasks] = React.useState([]);
  const [unreadSupportMsgCount, setUnreadSupportMsgCount] = React.useState(0);
  const [user] = useAuthUser();

  const userId = user.id;

  const navigate = useNavigate();

  const load$ = () => {
    return getMyNotifications$()
      .pipe()
      .subscribe(result => {
        setChangedTasks(result.changedTasks);
        setUnreadSupportMsgCount(result.unreadSupportMsgCount);
      });
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

  const items = changedTasks.map(x => ({
    key: x.taskId,
    // icon: <Icon component={MdDashboard} />,
    icon: <TaskIcon size={14} />,
    label: x.taskName,
    onClick: () => navigate(`/task/${x.taskId}`),
  }))

  if (unreadSupportMsgCount) {
    items.unshift({
      type: 'divider',
    })
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

  return <Dropdown trigger={['click']} menu={{ items }}>
    <Badge showZero={false} count={unreadSupportMsgCount + changedTasks.length} offset={[-4, 6]}>
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