
import React from 'react';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Typography, Button, Alert, Input, Modal, Form, Tooltip, Tag, Drawer, Radio } from 'antd';
import { RichTextInput } from 'components/RichTextInput';

const Container = styled.div`
  // margin: 0 auto 0 auto;
  // padding-top: 20px;
  // background-color: red;
  // height: calc(100vh - 220px);
  // height: 100%;
`;


export const DemplateEditorPanel = React.memo(props => {
  const { value, onChange } = props;

  return <Container>
    <RichTextInput value={value} onChange={onChange} />
  </Container>
});

DemplateEditorPanel.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
};

DemplateEditorPanel.defaultProps = {
};

