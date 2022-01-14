import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Button } from 'antd';

const { Text } = Typography;


const CheckboxButton = (props) => {

  const { value, onChange, children, ...other } = props;
  const [checked, setChecked] = React.useState(value);

  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    onChange(newValue);
  }

  return (
    <Button type="primary" ghost={!checked} {...other} onClick={handleToggle} 
    size="small" style={{borderRadius: 80, fontSize: 12}}>
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
