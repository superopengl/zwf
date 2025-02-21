import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import PropTypes from 'prop-types';
import { Avatar, Tooltip, Form, Switch, Input, Button, Drawer, Typography, Space } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import Field from '@ant-design/pro-field';
import React from 'react';
import Icon, { BellOutlined } from '@ant-design/icons';
import { DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons';
import { Divider } from 'antd';
import { OptionsBuilder } from '../pages/TaskTemplate/formBuilder/OptionsBuilder';
import DocTemplateSelect from 'components/DocTemplateSelect';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { getMyNotificationMessages$, reactOnNotificationMessage$ } from 'services/notificationMessageService';
import { Badge } from 'antd';
import { List } from 'antd';

const { Text, Title, Paragraph } = Typography;


export const NotificationButton = React.memo((props) => {
  const { field, onChange, trigger, children, onDelete } = props;
  const [list, setList] = React.useState([]);
  const [count, setCount] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const sub$ = open ? getMyNotificationMessages$()
      .pipe()
      .subscribe(result => {
        setList(result.list);
        setCount(result.count);
      }) : null;

    return () => sub$?.unsubscribe();
  }, [open])

  const handleClick = (id) => {
    reactOnNotificationMessage$(id).subscribe();
  }

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
    title={<List
      itemLayout="horizontal"
      dataSource={list}
      locale={{ emptyText: 'No notifications' }}
      renderItem={item => <List.Item onClick={() => handleClick(item.id)}>
        <List.Item.Meta
          title={item.message}
          description={<>description...</>}
        />
      </List.Item>}
    />}
  >
    <Badge showZero={false} count={count} offset={[-4, 6]}>
      <Button icon={<BellOutlined />} shape="circle" type="text" size="large" onClick={() => setOpen(true)} />
    </Badge>
  </Tooltip>
});


NotificationButton.propTypes = {
  size: PropTypes.number,
};

NotificationButton.defaultProps = {
  size: 20,
};