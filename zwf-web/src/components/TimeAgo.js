import React from 'react';
import PropTypes from 'prop-types';
import JavascriptTimeAgo from 'javascript-time-ago'
import { Space, Typography } from 'antd';
import en from 'javascript-time-ago/locale/en'
import ReactTimeAgo from 'react-time-ago'
import * as moment from 'moment';
import styled from 'styled-components';

JavascriptTimeAgo.addLocale(en);

const { Text } = Typography;

const StyledSpace = styled(Space)`
// font-size: 0.8rem;

.ant-space-item {
  margin-bottom: 0 !important;
  // line-height: 15px;
}
`

export const TimeAgo = React.memo(props => {
  const { prefix, value, defaultContent, direction, strong, extra, accurate, showAgo, showTime, type, toLocalTime } = props;
  if (!value) {
    return defaultContent || null;
  }
  let m = moment.utc(value);
  if(toLocalTime) {
    m = m.local();
  }
  return <StyledSpace size="small" direction="horizontal">
    <Space direction={direction} size="small">
      {prefix}
      {showAgo && <ReactTimeAgo date={m.toDate()} />}
      {showTime && m.format(accurate ? 'DD MMM YYYY HH:mm' : 'DD MMM YYYY')}
    </Space>
    {extra}
  </StyledSpace>
})

TimeAgo.propTypes = {
  prefix: PropTypes.any,
  value: PropTypes.any,
  defaultContent: PropTypes.any,
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  extra: PropTypes.any,
  strong: PropTypes.bool,
  accurate: PropTypes.bool.isRequired,
  showAgo: PropTypes.bool,
  showTime: PropTypes.bool,
  type: PropTypes.oneOf([null, 'secondary']),
  toLocalTime: PropTypes.bool
};

TimeAgo.defaultProps = {
  direction: 'vertical',
  extra: null,
  strong: false,
  accurate: true,
  showAgo: true,
  showTime: true,
  type: 'secondary',
  toLocalTime: true
};