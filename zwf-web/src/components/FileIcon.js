import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';
import { Tag, Badge } from 'antd';
import { CheckCircleFilled, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Icon, { CheckCircleOutlined } from '@ant-design/icons';
import { BsFillPenFill } from 'react-icons/bs';

const StyledFileIcon = styled.div`
  position: relative;
  display: inline-block;

  .overlay {
    position: absolute;
    // background-color: white;
    bottom: 0;
    right: 0;
    opacity: 0.5;
  }
`;

export const FileIcon = props => {
  const { name, width, style, type } = props;

  if (!name) return null;

  const height = width / 30 * 36;
  const tokens = name.split('.');
  const ext = tokens[tokens.length - 1];

  let overlayComponent = null;
  let dot = false;
  if (type === 'pending') {
    overlayComponent = <ClockCircleOutlined />
  } else if (type === 'await-sign') {
    dot = true;
  } else if (type === 'signed') {
    overlayComponent = <CheckCircleFilled style={{color: '#52c41a'}} />
  }

  return <StyledFileIcon style={{ ...style, width, height }}>
    <Badge count={overlayComponent} dot={dot}>
      <ReactFileIcon extension={ext} {...defaultStyles[ext]} fold={false} />
    </Badge>
  </StyledFileIcon>;
}

FileIcon.propTypes = {
  name: PropTypes.string,
  width: PropTypes.number,
  type: PropTypes.oneOf(['default', 'pending', 'await-sign', 'signed'])
};

FileIcon.defaultProps = {
  width: 30,
  type: 'default'
};
