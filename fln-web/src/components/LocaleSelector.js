
import React from 'react';
import styled from 'styled-components';
import { Select, Button } from 'antd';

export const LocaleSelector = props => {
  return (
    <Select {...props}>
      <Select.Option key="0" value='en-US'>English</Select.Option>
      <Select.Option key="1" value='zh-CN'>简体中文</Select.Option>
      <Select.Option key="2" value='zh-TW'>繁體中文</Select.Option>
    </Select>
  )
}