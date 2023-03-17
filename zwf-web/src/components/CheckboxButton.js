import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import Icon from '@ant-design/icons';
import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';


const CheckboxButton = (props) => {

  const { value, onChange, children, ...other } = props;
  const [checked, setChecked] = React.useState(value);

  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    onChange(newValue);
  }

  return (
    <Button type="primary" ghost={!checked} {...other} onClick={handleToggle} icon={<Icon component={checked ? BsCheckCircleFill : BsCircle} />}>
      {children}
    </Button>
  );
};

CheckboxButton.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.bool.isRequired
};

CheckboxButton.defaultProps = {
  value: false
};

export default CheckboxButton;
