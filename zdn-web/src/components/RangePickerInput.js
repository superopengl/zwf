
import React from 'react';
import { DatePicker } from 'antd';
import * as moment from 'moment';

const { RangePicker } = DatePicker;

function convertToMoments(value) {
  if (!value) return value;
  return Array.isArray(value) ? value.map(x => moment(x)) : moment(value);
}

export const RangePickerInput = (props) => {
  const { defaultValue, value } = props;
  return <RangePicker {...props}
    defaultValue={convertToMoments(defaultValue)}
    value={convertToMoments(value)}
    onChange={(moment, dateString) => props.onChange(dateString)} />;
}

RangePickerInput.propTypes = {
  // defaultValue: PropTypes.string,
  // value: PropTypes.string
};
