import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';

const { Text } = Typography;


const MoneyAmount = (props) => {

  const { value, symbol, postfix, digital, ...other } = props;

  return (
    <Text {...other}>
      {symbol ? `${symbol} `: ''}{(+value || 0).toFixed(digital)}{postfix ? ` ${postfix}`: ''}
    </Text>
  );
};

MoneyAmount.propTypes = {
  value: PropTypes.any.isRequired,
  symbol: PropTypes.string,
  postfix: PropTypes.string,
  digital: PropTypes.number,
};

MoneyAmount.defaultProps = {
  value: 0,
  symbol: '$',
  postfix: '',
  digital: 2
};

export default MoneyAmount;
