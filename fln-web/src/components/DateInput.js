
import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import * as moment from 'moment';

export const DateInput = (props) => {
  const {defaultValue, value} = props;

  const getMomentValue = (value) => {
    if(!value) return value;
    const {format} = props;
    return format ? moment(value, format) : moment(value);
  }

  return <DatePicker {...props} 
  defaultValue={getMomentValue(defaultValue)}
  value={getMomentValue(value)}
  onChange={(moment, dateString) => props.onChange(dateString)} />;
}

DateInput.propTypes = {
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

DateInput.propTypes = {
  onChange: () => {}
};
