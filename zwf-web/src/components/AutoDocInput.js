
import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Form } from 'antd';
import * as moment from 'moment';

export const AutoDocInput = (props) => {
  const {value: taskDocId} = props;
  const formInstance = Form.useFormInstance();


  return <>{taskDocId}</>
}

AutoDocInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

AutoDocInput.propTypes = {
  onChange: () => {}
};
