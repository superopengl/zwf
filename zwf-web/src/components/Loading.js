import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const Loading = props => {
  const { loading, size, children } = props;

  return <Spin
    spinning={loading}
    indicator={<LoadingOutlined style={{ fontSize: size }} spin />}
    style={{ width: '100%' }}
  >
    {children}
  </Spin>
}

Loading.propTypes = {
  loading: PropTypes.bool.isRequired,
  size: PropTypes.number,
};

Loading.defaultProps = {
  loading: true,
  size: 24
};
