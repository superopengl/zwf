import React from 'react';
import PropTypes from 'prop-types';
import { Tag as AntdTag } from 'antd';
import styled from 'styled-components';


const StyledTag = styled(AntdTag)`
font-size: 11px;
border-radius: 999px;
text-transform: lowercase;
`;

export const VarTag = (props) => {

  const { children } = props;
  return (
    <StyledTag color="processing">{children}</StyledTag>
  );
};

VarTag.propTypes = {
};

VarTag.defaultProps = {
};

