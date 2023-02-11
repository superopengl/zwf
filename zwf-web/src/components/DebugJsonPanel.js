
import React from 'react';
import { Link } from 'react-router-dom';
import { Row } from 'antd';
import Field from '@ant-design/pro-field';

export const DebugJsonPanel = (props) => <Row>
  <Field valueType="jsonCode" text={JSON.stringify(props.value)} />
</Row>

