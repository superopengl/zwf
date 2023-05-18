import React from 'react';
import PropTypes from 'prop-types';
import { useZevent } from 'hooks/useZevent';
import { SyncOutlined } from '@ant-design/icons';
import { Badge, Button, Tooltip } from 'antd';
import { useAuthUser } from 'hooks/useAuthUser';
import { NotificationContext } from 'contexts/NotificationContext';

export const TaskUnreadCommentBadge = React.memo((props) => {
  const { taskId, tooltip, offset, children } = props;
  const [user] = useAuthUser();
  const [count, setCount] = React.useState(0);
  const { zevents } = React.useContext(NotificationContext);

  React.useEffect(() => {
    const num = zevents.filter(z => z.payload.taskId === taskId
      && z.payload.type === 'task-comment'
      && z.payload.by !== user.id
      && !z.payload.ackAt).length;
    setCount(num);
  }, [zevents])

  return (<Tooltip title={count ? tooltip : null}>
    <Badge count={count} showZero={false} offset={offset}>
      {children}
    </Badge>
  </Tooltip>
  );
});

TaskUnreadCommentBadge.propTypes = {
  taskId: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
};

TaskUnreadCommentBadge.defaultProps = {
};

