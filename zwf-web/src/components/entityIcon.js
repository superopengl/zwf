import { Typography } from 'antd';

import React from 'react';
import { withRouter } from 'react-router-dom';
import Icon, { BorderOutlined, FileOutlined, UserOutlined } from '@ant-design/icons';
import { FaTasks } from 'react-icons/fa';
import { ImInsertTemplate } from 'react-icons/im';
import PropTypes from 'prop-types';

const { Text, Paragraph, Link: TextLink } = Typography;

export const EntityIcon = React.memo(props => {
  const {icon, color, style} = props;
  return <Icon style={{
    color: '#ffffffdd',
    border: `1px ${color} solid`,
    borderRadius: 3,
    backgroundColor: color,
    padding: 3,
    marginRight: 10,
    ...style
  }} component={() => icon} />
});

EntityIcon.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.object,
  style: PropTypes.object,
};

EntityIcon.defaultProps = {
  icon: <BorderOutlined/>,
  color: '#555555',
};

export const TaskIcon = (props) => <EntityIcon icon={<FaTasks />} color="#fadb14" style={props.style} /> 
export const TaskTemplateIcon = (props) => <EntityIcon icon={<ImInsertTemplate />} color="#9254de" style={props.style} /> 
export const DocTemplateIcon = (props) => <EntityIcon icon={<FileOutlined />} color="#096dd9" style={props.style} /> 


