import { Input } from 'antd';
import React from 'react';
import { CopyOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip } from 'antd';

import styled from 'styled-components';

const Container = styled.div`
&:hover {
  cursor: pointer;
}
`;

export const ClickToCopyTooltip = React.memo((props) => {

  const { value } = props;
  const MESSAGE_BEFORE_COPY = 'Click to copy to clipboard';
  const MESSAGE_AFTER_COPY = 'Copied';

  const [tipMessage, setTipMessage] = React.useState(MESSAGE_BEFORE_COPY);

  const handleCopied = (text, result) => {
    if (result) {
      setTipMessage(MESSAGE_AFTER_COPY);
    }
  }

  const handleTipVisibleChange = (visible) => {
    if (visible) {
      setTipMessage(MESSAGE_BEFORE_COPY);
    }
  }

  return (
    <Tooltip title={tipMessage} onVisibleChange={handleTipVisibleChange}>
      <CopyToClipboard text={value} onCopy={handleCopied}>
        <Container>
          {props.children}
        </Container>
      </CopyToClipboard>
    </Tooltip>
  )
});

ClickToCopyTooltip.propTypes = {
  value: PropTypes.string,
};

ClickToCopyTooltip.defaultProps = {
};

