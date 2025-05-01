import React from 'react';
import PropTypes from 'prop-types';
import { Badge, Tooltip } from 'antd';
import { useAuthUser } from 'hooks/useAuthUser';
import { ZeventContext } from 'contexts/ZeventContext';

export const ZeventBadge = React.memo((props) => {
  const { filter, selfEvent, tooltip, showNumber, children, ...others } = props;
  const [user] = useAuthUser();
  const [count, setCount] = React.useState(0);
  const { zevents } = React.useContext(ZeventContext);

  const filterFunc = React.useCallback(z => (selfEvent || z.payload.by !== user.id) && filter?.(z)
    , [filter, selfEvent, user]);

  React.useEffect(() => {
    if (showNumber) {
      setCount(zevents.filter(filterFunc).length);
    } else {
      setCount(zevents.find(filterFunc) ? 1 : 0);
    }
  }, [filterFunc, showNumber, zevents]);

  return (<Tooltip title={count ? tooltip : null}>
    <Badge count={showNumber ? count : count ? '!' : 0} {...others}>
      {children}
    </Badge>
  </Tooltip>
  );
});

ZeventBadge.propTypes = {
  tooltip: PropTypes.string,
  filter: PropTypes.func,
  selfEvent: PropTypes.bool,
  showNumber: PropTypes.bool,
};

ZeventBadge.defaultProps = {
  tooltip: null,
  filter: (z) => false,
  selfEvent: false,
  showNumber: true,
};

