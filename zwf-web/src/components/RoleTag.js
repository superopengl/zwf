import React from 'react';
import PropTypes from 'prop-types';
import { Tag } from 'antd';

export const RoleTag = React.memo((props) => {

  const { role } = props;

  const color = role === 'system' ? '#F53F3F' :
    role === 'admin' ? '#07828B' :
      role === 'agent' ? '#0FBFC4' :
        role === 'client' ? '#F7BA1E' :
          undefined;

  return (
    <Tag color={color}>
      {role}
    </Tag>
  );
});

RoleTag.propTypes = {
  role: PropTypes.oneOf(['system', 'admin', 'agent', 'client', 'guest']).isRequired,
};

RoleTag.defaultProps = {
};

