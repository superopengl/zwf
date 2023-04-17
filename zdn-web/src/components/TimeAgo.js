import React from 'react';
import PropTypes from 'prop-types';
import JavascriptTimeAgo from 'javascript-time-ago'
import { Space, Typography } from 'antd';
import en from 'javascript-time-ago/locale/en'
import ReactTimeAgo from 'react-time-ago'
import * as moment from 'moment-timezone';
import styled from 'styled-components';

JavascriptTimeAgo.addLocale(en);

const { Text } = Typography;

const StyledSpace = styled(Space)`
// font-size: 0.8rem;

.ant-space-item {
  margin-bottom: 0 !important;
  line-height: 15px;
}
`
const CLIENT_TZ = 'Australia/Sydney';

export const TimeAgo = props => {
  const { prefix, value, defaultContent, direction, strong, extra, accurate, showTime, size, type } = props;
  if (!value) {
    return defaultContent || null;
  }
  const m = moment.tz(value, CLIENT_TZ);
  const realPrefix = prefix?.trim() ? `${prefix.trim()} ` : null;
  const expression = m.format(showTime ? 'DD MMM YYYY HH:mm' : 'DD MMM YYYY');
  return <StyledSpace size="small" direction="horizontal">
    <Space direction={direction} size="small">
      <Text strong={strong} type={type}>{realPrefix}<ReactTimeAgo date={m.toDate()} /></Text>
      {accurate && <Text strong={strong} type={type}>
        {size === 'small' ? <small>{expression}</small> : expression}
      </Text>}
    </Space>
    {extra}
  </StyledSpace>
}

TimeAgo.propTypes = {
  prefix: PropTypes.string,
  value: PropTypes.any,
  defaultContent: PropTypes.any,
  direction: PropTypes.string,
  extra: PropTypes.any,
  strong: PropTypes.bool,
  accurate: PropTypes.bool.isRequired,
  showTime: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default']),
  type: PropTypes.oneOf(['primary', 'secondary'])
};

TimeAgo.defaultProps = {
  direction: 'vertical',
  extra: null,
  strong: false,
  accurate: true,
  showTime: true,
  size: 'small',
  type: 'secondary'
};