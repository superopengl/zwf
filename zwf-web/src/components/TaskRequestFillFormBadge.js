import React from 'react';
import PropTypes from 'prop-types';
import { ZeventBadge } from 'components/ZeventBadge';

export const TaskRequestFillFormBadge = React.memo((props) => {
  const { taskId, children, ...others } = props;

  const handleZeventFilter = React.useCallback(z => {
    return z.payload.taskId === taskId
      && z.payload.type === 'request-client-fill-form'
  }, []);

  return (<ZeventBadge {...others} selfEvent={false} showNumber={false} filter={handleZeventFilter}>
    {children}
  </ZeventBadge>
  );
});

TaskRequestFillFormBadge.propTypes = {
  taskId: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
};

TaskRequestFillFormBadge.defaultProps = {
};

