import React from 'react';
import PropTypes from 'prop-types';
import { ZeventBadge } from 'components/ZeventBadge';

export const TaskUnreadCommentBadge = React.memo((props) => {
  const { taskId, children, ...others } = props;

  const handleZeventFilter = React.useCallback(z => {
    return z.payload.taskId === taskId
      && z.payload.type === 'task-comment'
  }, []);

  return (<ZeventBadge {...others} selfEvent={false} showNumber={true} filter={handleZeventFilter}>
    {children}
  </ZeventBadge>
  );
});

TaskUnreadCommentBadge.propTypes = {
  taskId: PropTypes.string.isRequired,
};

TaskUnreadCommentBadge.defaultProps = {
};

