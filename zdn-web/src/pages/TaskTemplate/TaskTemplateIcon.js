import { Typography } from 'antd';

import React from 'react';
import { withRouter } from 'react-router-dom';
import Icon from '@ant-design/icons';
import { FaTasks } from 'react-icons/fa';

const { Text, Paragraph, Link: TextLink } = Typography;

export const TaskTemplateIcon = props => {
  const color = props.color || '#9254de';
  return <Icon style={{
    color: '#ffffffdd',
    border: `1px ${color} solid`,
    borderRadius: 3,
    backgroundColor: color,
    padding: 3
  }} component={() => <FaTasks />} />
};

TaskTemplateIcon.propTypes = {};

TaskTemplateIcon.defaultProps = {};

export default withRouter(TaskTemplateIcon);
