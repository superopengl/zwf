import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';


const StyledFileIcon = styled.div`
  display: inline-block;
`;

export const FileIcon = props => {
  const { name, width, style } = props;

  if(!name) return null;

  const height = width / 30 * 36;
  const tokens = name.split('.');
  const ext = tokens[tokens.length - 1];

  return <StyledFileIcon style={{...style, width, height }}><ReactFileIcon extension={ext} {...defaultStyles[ext]} /></StyledFileIcon>;
}

FileIcon.propTypes = {
  name: PropTypes.string,
  width: PropTypes.number,
};

FileIcon.defaultProps = {
  width: 30,
};
