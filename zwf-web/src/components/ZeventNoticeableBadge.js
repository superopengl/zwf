import React from 'react';
import PropTypes from 'prop-types';
import { useZevent } from 'hooks/useZevent';
import { SyncOutlined } from '@ant-design/icons';
import { Badge, Button, Tooltip } from 'antd';
import { useAuthUser } from 'hooks/useAuthUser';

export const ZeventNoticeableBadge = React.memo((props) => {
  const { filter, selfEvent, message, children } = props;
  const [user] = useAuthUser();

  const [hasNew, setHasNew] = React.useState(false);

  useZevent(z => {
    return (selfEvent || z.payload.by !== user.id) && filter?.(z);
  }, () => setHasNew(true));

  const handleClick = () => {
    setHasNew(false);
  }

  return (<Tooltip title={hasNew ? message : null}>
    <Badge count={hasNew ? ' ' : 0} size="small">
      <div onClick={handleClick}>
        {children}
      </div>
    </Badge>
  </Tooltip>
  );
});

ZeventNoticeableBadge.propTypes = {
  message: PropTypes.string,
  filter: PropTypes.func,
  selfEvent: PropTypes.bool,
};

ZeventNoticeableBadge.defaultProps = {
  message: 'Event fired',
  filter: (z) => false,
  selfEvent: false,
};

