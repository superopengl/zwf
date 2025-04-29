import React from 'react';
import PropTypes from 'prop-types';
import { useZevent } from 'hooks/useZevent';
import { SyncOutlined } from '@ant-design/icons';
import { Badge, Button, Tooltip } from 'antd';
import { useAuthUser } from 'hooks/useAuthUser';

export const ZeventNoticeableBadge = React.memo((props) => {
  const { filter, selfEvent, tooltip, showNumber, children } = props;
  const [user] = useAuthUser();
  const [count, setCount] = React.useState(0);


  useZevent(z => {
    return (selfEvent || z.payload.by !== user.id) && filter?.(z);
  }, () => setCount(pre => pre + 1));

  return (<Tooltip title={count ? tooltip : null}>
    <Badge count={showNumber ? count : count ? ' ' : 0}>
      {children}
    </Badge>
  </Tooltip>
  );
});

ZeventNoticeableBadge.propTypes = {
  tooltip: PropTypes.string,
  filter: PropTypes.func,
  selfEvent: PropTypes.bool,
  showNumber: PropTypes.bool,
};

ZeventNoticeableBadge.defaultProps = {
  tooltip: 'Event fired',
  filter: (z) => false,
  selfEvent: false,
  showNumber: true,
};

