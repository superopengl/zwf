import React from 'react';
import PropTypes from 'prop-types';
import { Tag as AntdTag } from 'antd';
import styled from 'styled-components';


const ClicableTag = styled(AntdTag)`
  &:hover {
    cursor: pointer;
  }
`;

const Tag = (props) => {

  const { children, clickable, checked, style: propStyle, onClick, ...other } = props;

  const style = {
    textAlign: 'center',
    ...propStyle,
  }

  const TagComponent = clickable ? ClicableTag : AntdTag;

  const colorProp = checked ? {color: '#0FBFC4'} : null;

  return (
    <TagComponent
      onClick={onClick}
      style={style}
      {...other}
      {...colorProp}
    >
      {children}
      {/* {checked && <CheckOutlined style={{ marginLeft: 10 }} />} */}
    </TagComponent>
  );
};

Tag.propTypes = {
  // value: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
};

Tag.defaultProps = {
  checked: false,
  clickable: false,
  onClick: () => { }
};

export default Tag;
