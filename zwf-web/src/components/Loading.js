import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
const loadingIndicator = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export const Loading = props => {
  const { loading, children } = props;

return <Spin spinning={loading} indicator={loadingIndicator} style={{width: '100%'}}>{!loading && children}</Spin>
}

Loading.propTypes = {
  loading: PropTypes.bool.isRequired,
};

Loading.defaultProps = {
  loading: true
};
