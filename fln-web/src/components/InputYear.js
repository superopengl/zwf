
import React from 'react';
import styled from 'styled-components';
import { Select, Button } from 'antd';

export const InputYear = (props) => {
  const thisYear = new Date().getFullYear();
  const options = [0, -1, -2].map(x => `${thisYear + x - 1} - ${thisYear + x}`);

  return (
    <Select onChange={props.onChange} disabled={props.disabled}>
      {options.map(x => <Select.Option key={x} value={x}>{x}</Select.Option>)}
    </Select>
  )
};