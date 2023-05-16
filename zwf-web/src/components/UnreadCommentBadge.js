import React from 'react';
import PropTypes from 'prop-types';
import { useZevent } from 'hooks/useZevent';
import { SyncOutlined } from '@ant-design/icons';
import { Badge, Button, Tooltip } from 'antd';
import { useAuthUser } from 'hooks/useAuthUser';

export const UnreadCommentBadge = React.memo((props) => {
  const { taskId, tooltip } = props;
  const [user] = useAuthUser();

  const [count, setCount] = React.useState(0);

  const filterZevent = z => {
    return ((z.type === 'taskEvent' && z.payload.type === 'comment') || z.type === 'taskEvent.ack') && z.payload.taskId === taskId;
  }

  const handleZevent = z => {
    const { payload: { by }, type } = z;
    if (by !== user.id) {
      const change = type === 'taskEvent' ? 1 : -1;
      setCount(pre => pre + change)
    }
  }

  useZevent(filterZevent, handleZevent);

  return (<Tooltip title={count ? tooltip : null}>
    <Badge count={count} showZero={false}>
    </Badge>
  </Tooltip>
  );
});

UnreadCommentBadge.propTypes = {
  taskId: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
};

UnreadCommentBadge.defaultProps = {
};

