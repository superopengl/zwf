import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FileIcon as ReactFileIcon, defaultStyles } from 'react-file-icon';
import { Tag, Badge, Tooltip } from 'antd';
import Icon, { CheckCircleFilled, CheckOutlined, ClockCircleOutlined, ClockCircleFilled, StopFilled } from '@ant-design/icons';
import { BsFillPenFill } from 'react-icons/bs';
import { RiQuillPenFill, RiQuillPenLine } from 'react-icons/ri';

const StyledFileIcon = styled.div`
  position: relative;
  display: inline-block;
`;

export const FileIcon = props => {
  const { name, width, style, type } = props;

  if (!name) return null;

  const height = width / 30 * 36;
  const tokens = name.split('.');
  const ext = tokens[tokens.length - 1];

  let overlayComponent = null;
  let dot = false;
  let title = null;
  if (type === 'pending') {
    overlayComponent = <StopFilled style={{color: '#aaaaaa'}}/>
    title = "Pending generating doc"
  } else if (type === 'await-sign') {
    overlayComponent = <Icon component={RiQuillPenLine} style={{ color: '#cf222e' }} />
    title = "Await client's sign"
  } else if (type === 'signed') {
    overlayComponent = <Icon component={RiQuillPenFill} style={{ color: '#52c41a' }} />
    title = "Signed";
  }

  return <StyledFileIcon style={{ ...style, width, height }}>
    <Tooltip title={title}>
      <Badge count={overlayComponent} dot={dot}>
        <ReactFileIcon extension={ext} {...defaultStyles[ext]} fold={false} />
      </Badge>
    </Tooltip>
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
