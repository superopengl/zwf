import React from 'react';
import PropTypes from 'prop-types';
import 'antd/dist/antd.less';
import 'react-image-lightbox/style.css';
import { Route } from 'react-router-dom';
import OtherPage from 'pages/OtherPage';

export const RoleRoute = props => {
  const { visible, loading, component, ...otherProps } = props;
  return <Route {...otherProps} component={loading ? null : visible ? component : OtherPage} />
}

RoleRoute.propTypes = {
  visible: PropTypes.bool,
  loading: PropTypes.bool
};

RoleRoute.defaultProps = {
  visible: true,
  loading: false
}