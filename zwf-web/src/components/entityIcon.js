
import React from 'react';

import Icon, { BorderOutlined, UserOutlined } from '@ant-design/icons';
import { FaTasks } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { MdDashboard, MdOutlinePages } from 'react-icons/md';
import { MdSpaceDashboard } from 'react-icons/md';
import { BsFileEarmarkTextFill } from 'react-icons/bs';


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

export const TaskIcon = (props) => <EntityIcon icon={<MdDashboard />} color="#0FBFC4" style={props.style} /> 
export const TaskTemplateIcon = (props) => <EntityIcon icon={<Icon component={MdSpaceDashboard} />} color="#9254de" style={props.style} /> 
export const DocTemplateIcon = (props) => <EntityIcon icon={<Icon component={BsFileEarmarkTextFill} />} color="#cf222e" style={props.style} /> 
export const ResourcePageIcon = (props) => <EntityIcon icon={<MdOutlinePages />} color="#13c2c2" style={props.style} /> 
export const ClientIcon = (props) => <EntityIcon icon={<UserOutlined />} color="#00232944" style={props.style} /> 


