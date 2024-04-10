
import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import * as moment from 'moment';

export const DateInput = (props) => {
  const {defaultValue, value, onChange, ...otherProps} = props;

  const getMomentValue = (value) => {
    if(!value) return value;
    const {format} = props;
    return format ? moment(value, format) : moment(value);
  }

  const handleChange = (m, dateString) => {
    onChange(dateString);
  }

  return <DatePicker {...otherProps} 
  defaultValue={getMomentValue(defaultValue)}
  value={getMomentValue(value)}
  onChange={handleChange}
   />;
}

DateInput.propTypes = {
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

DateInput.propTypes = {
  onChange: () => {}
};
