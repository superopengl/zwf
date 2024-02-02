
import React from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledInput = styled(Input)`
border-radius: 0px;
width: 100%;

&.error {
  border-color: #ff4d4f;
}

&:focus, &:active {
  border-bottom: 1px solid #37AFD2;
  background-color: white;

  &.error {
    border-color: #ff4d4f;
  }
}
`;

export const ClickToEditInput = React.memo((props) => {
  const { value: propValue, size, onChange, ...others } = props;

  const [value, setValue] = React.useState(propValue);
  const [className, setClassName] = React.useState(propValue ? '' : 'error');

  React.useEffect(() => {
    setValue(propValue);
  }, [propValue])

  const handleSave = (e) => {
    const text = e.target.value?.trim();
    if (!text) {
      setClassName('error');
      return;
    }

    setClassName('');
    if (text !== propValue) {
      onChange(text);
    }
  }

  return <>
    <StyledInput
      {...others}
      className={className}
      value={value}
      onChange={e => setValue(e.target.value)}
      bordered={false}
      onBlur={handleSave}
      style={{ fontSize: size }}
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
