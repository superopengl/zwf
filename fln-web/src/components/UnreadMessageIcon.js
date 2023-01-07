import React from 'react';
import { Tooltip } from 'antd';
import { MessageFilled } from '@ant-design/icons';


export const UnreadMessageIcon = props => {
  const style={
    display: 'inline-block',
    ...props.style
  }
  return <div style={style}>
    <Tooltip title="There are unread messages" >
      <MessageFilled style={{ marginLeft: 4 }} />
    </Tooltip>
  </div>
}

