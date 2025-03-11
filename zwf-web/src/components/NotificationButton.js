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

const { Text, Title, Paragraph, Link } = Typography;

const StyledList = styled(List)`
.ant-list-item {
  &:hover {
    cursor: pointer;
  }
}
`;


export const NotificationButton = React.memo((props) => {
  const { field, onChange, trigger, children, onSupportOpen } = props;
  const [changedTasks, setChangedTasks] = React.useState([]);
  const [unreadSupportMsgCount, setUnreadSupportMsgCount] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    const sub$ = getMyNotifications$()
      .pipe()
      .subscribe(result => {
        setChangedTasks(result.changedTasks);
        setUnreadSupportMsgCount(result.unreadSupportMsgCount);
      });

    return () => sub$.unsubscribe();
  }, [])

  useZevent(z => z.type === 'support', z => {
    setUnreadSupportMsgCount(pre => pre + 1)
  });

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
      icon: <Text style={{fontSize: 24, color:'#0FBFC4' }}><CommentOutlined /></Text>,
      label: <>Unread support message <Badge count={unreadSupportMsgCount} /></>,
      onClick: () => {
        onSupportOpen()
        setUnreadSupportMsgCount(0)
      },
    })
  }

  return <Dropdown trigger={['click']} menu={{ items }}>
    <Badge showZero={false} count={unreadSupportMsgCount + changedTasks.length} offset={[-4, 6]}>
      <Button icon={<BellOutlined />} shape="circle" type="text" size="large" onClick={() => setOpen(true)} />
    </Badge>
  </Dropdown>

  return <Tooltip
    open={open}
    // arrow={false}
    // align={{ offset: [14, -16], targetOffset: [-14, 0] }}
    // zIndex={200}
    placement="bottomRight"
    color="white"
    trigger="click"
    overlayInnerStyle={{ width: 300 }}
    onOpenChange={setOpen}
    title={<>
      <StyledList
        itemLayout="horizontal"
        dataSource={items}
        locale={{ emptyText: 'No notifications' }}
        renderItem={(item, index) => <List.Item onClick={item.onClick}>
          {item.icon} {item.title}
        </List.Item>}
      />
    </>}
  >
    <Dropdown trigger={['click']} menu={{ items }}>
      <Badge showZero={false} count={unreadSupportMsgCount + changedTasks.length} offset={[-4, 6]}>
        <Button icon={<BellOutlined />} shape="circle" type="text" size="large" onClick={() => setOpen(true)} />
      </Badge>
    </Dropdown>
  </Tooltip>
});


NotificationButton.propTypes = {
  onSupportOpen: PropTypes.func,
};

NotificationButton.defaultProps = {
  onSupportOpen: () => { },
};