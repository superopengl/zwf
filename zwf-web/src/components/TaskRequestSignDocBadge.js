import React from 'react';
import PropTypes from 'prop-types';
import { ZeventBadge } from 'components/ZeventBadge';

export const TaskRequestSignDocBadge = React.memo((props) => {
  const { taskId, children, ...others } = props;

  const handleZeventFilter = React.useCallback(z => {
    return z.payload.taskId === taskId
      && ['request-client-sign-doc', 'unrequest-client-sign-doc'].includes(z.payload.type)
  }, []);

  return (<ZeventBadge {...others} selfEvent={false} showNumber={false} filter={handleZeventFilter}>
    {children}
  </ZeventBadge>
  );
});

TaskRequestSignDocBadge.propTypes = {
  taskId: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
};

TaskRequestSignDocBadge.defaultProps = {
};

