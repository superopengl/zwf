import { Typography } from 'antd';

import React from 'react';

import Icon, { BorderOutlined, FileOutlined, FilePdfFilled, FilePdfOutlined, UserOutlined } from '@ant-design/icons';
import { FaTasks } from 'react-icons/fa';
import { ImInsertTemplate } from 'react-icons/im';
import PropTypes from 'prop-types';
import { FileIcon } from './FileIcon';
import { MdOutlinePages } from 'react-icons/md';

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

export const TaskIcon = (props) => <EntityIcon icon={<FaTasks />} color="#37AFD2" style={props.style} /> 
export const TaskTemplateIcon = (props) => <EntityIcon icon={<ImInsertTemplate />} color="#9254de" style={props.style} /> 
export const DocTemplateIcon = (props) => <EntityIcon icon={<FilePdfFilled />} color="#cf222e" style={props.style} /> 
export const ResourcePageIcon = (props) => <EntityIcon icon={<MdOutlinePages />} color="#13c2c2" style={props.style} /> 
export const ClientIcon = (props) => <EntityIcon icon={<UserOutlined />} color="#00232944" style={props.style} /> 


