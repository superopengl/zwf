
import React from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { InputNumber } from 'antd';
import { Select } from 'antd';
import { isNil, isNumber } from 'lodash';

const StyledInputNumber = styled(InputNumber)`
&.error {

  .ant-input-number, .ant-input-number-group-addon {
    border-color: #cf222e;
  }
}
`;

const validateValues = (number, unit) => {
  if (isNumber(+number) && unit) {
    return true;
  }
  if (isNil(number) && isNil(unit)) {
    return true;
  }

  return false;
}

export const EstInput = React.memo((props) => {
  const { value, onChange, ...others } = props;

  const [numberValue, setNumberValue] = React.useState(value?.[0]);
  const [unitValue, setUnitValue] = React.useState(value?.[1]);
  const [valid, setValid] = React.useState(validateValues(numberValue, unitValue));

  React.useEffect(() => {
    setNumberValue(value?.[0]);
    setUnitValue(value?.[1]);
  }, [value]);

  React.useEffect(() => {
    const isValid = validateValues(numberValue, unitValue);
    setValid(isValid)
    if (isValid) {
      onChange([numberValue, unitValue]);
    }
  }, [numberValue, unitValue]);

  const handleEstNumberChange = (number) => {
    setNumberValue(number);
  }

  const handleEstUnitChange = unit => {
    setUnitValue(unit);
  }

  return <>
    <StyledInputNumber
      {...others}
      className={valid ? '' : 'error'}
      value={numberValue}
      onChange={handleEstNumberChange}
      addonAfter={<Select style={{ width: 100 }}
        value={unitValue}
        onChange={handleEstUnitChange}
        options={[
          {
            label: 'hours',
            value: 'hour',
          },
          {
            label: 'days',
            value: 'day',
          },
          {
            label: 'weeks',
            value: 'week',
          },
        ]} />} />
  </>
});

EstInput.propTypes = {
  // value: PropTypes.string,
};

EstInput.defaultProps = {
};
