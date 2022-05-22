import React from 'react';
import PropTypes from 'prop-types';
import 'antd/dist/antd.less';
import { Route } from 'react-router-dom';
import OtherPage from 'pages/OtherPage';
import PortalApp from 'pages/PortalApp';
import Error404 from 'pages/Error404';

export const RoleRoute = props => {
  const { visible, loading, component, ...otherProps } = props;
  return <Route {...otherProps} component={loading ? null : visible ? component : Error404} />
}

RoleRoute.propTypes = {
  visible: PropTypes.bool,
  loading: PropTypes.bool
};

RoleRoute.defaultProps = {
  visible: true,
  loading: false
}