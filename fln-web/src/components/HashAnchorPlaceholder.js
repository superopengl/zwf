
import React from 'react';
import styled from 'styled-components';

const VirtualAnchor = styled.div`
visibility: hidden;
position: relative;
`;

export const HashAnchorPlaceholder = (props) => (
  <VirtualAnchor id={props.id}
    style={{ top: props.offset === undefined ? -64 : props.offset }}
  />
)