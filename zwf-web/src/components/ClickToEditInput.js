
import React from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledInput = styled(Input)`
border-radius: 4px;
width: 100%;

// &:hover {
//   border: 1px solid #0FBFC4AA;
//   background-color: white;
// }

// &:focus, &:focus-within, &:active {
//   border: 1px solid #0FBFC4;
//   background-color: white;
// }

&.error {
  border: 1px solid #cf222e;
  background-color: white;
}
`;

export const ClickToEditInput = React.memo((props) => {
  const { value: propValue, size, onChange, ...others } = props;

  const [value, setValue] = React.useState(propValue);
  const [focused, setFocused] = React.useState(false);
  const [className, setClassName] = React.useState(propValue ? '' : 'error');

  React.useEffect(() => {
    setValue(propValue);
  }, [propValue])

  const handleSave = (e) => {
    setFocused(false)
    const text = e.target.value?.trim();
    if (!text) {
      // setClassName('error');
      setValue(propValue);
      return;
    }

    setClassName('');
    if (text !== propValue) {
      onChange(text);
    }
  }

  const handlePressEnter = e => {
    e.target.blur();
  }

  return <>
    <StyledInput
      allowClear={focused}
      {...others}
      className={className}
      value={value}
      onChange={e => setValue(e.target.value)}
      onClick={() => setFocused(true)}
      bordered={focused}
      onBlur={handleSave}
      onPressEnter={handlePressEnter}
      style={{ fontSize: size -1  }}
    // onPressEnter={handleSave}
    />
  </>
});

ClickToEditInput.propTypes = {
  value: PropTypes.string,
  size: PropTypes.number,
  required: PropTypes.bool.isRequired,
};

ClickToEditInput.defaultProps = {
  value: '',
  size: 14,
  required: true
};
