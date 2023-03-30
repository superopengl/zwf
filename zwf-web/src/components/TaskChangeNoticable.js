import React from 'react';
import PropTypes from 'prop-types';
import { useZevent } from 'hooks/useZevent';
import { SyncOutlined } from '@ant-design/icons';
import { Badge, Button, Tooltip } from 'antd';
import { useAuthUser } from 'hooks/useAuthUser';

export const TaskChangeNoticable = React.memo((props) => {
  const { filter, selfEvent, message, children } = props;
  const [user] = useAuthUser();

  const [show, setShow] = React.useState(false);

  useZevent(z => {
    return (selfEvent || z.by !== user.id) && filter(z);
  }, () => setShow(true));

  const handleClick = () => {
    setShow(false);
  }

  return (<Tooltip title={show ? message : null}>
    <Badge count={show ? ' ' : 0} size="small">
      <div onClick={handleClick}>
        {children}
      </div>
    </Badge>
  </Tooltip>
  );
});

TaskChangeNoticable.propTypes = {
  taskId: PropTypes.string.isRequired,
  message: PropTypes.string,
  filter: PropTypes.func,
  selfEvent: PropTypes.bool,
};

TaskChangeNoticable.defaultProps = {
  message: 'Event fired',
  filter: (z) => false,
  selfEvent: false,
};

