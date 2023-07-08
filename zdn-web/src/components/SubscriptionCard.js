import React from 'react';
import PropTypes from 'prop-types';
import { Spin, Typography, Card, Space, Tag } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { IconContext } from "react-icons";
import MoneyAmount from './MoneyAmount';
import { Divider } from 'antd';

const { Title, Text } = Typography;

const StyledCard = styled(Card)`
padding: 10px;
text-align: center;
height: 100%;
& .ant-card-head {
  color: #333333;
}
position: relative;
max-width: 400px;

&.subscription-active {
// box-shadow: 0 5px 3px rgba(255,197,61,0.8);
border: 2px solid #13c2c2;
background-color: rgba(19,194,194, 0.1);
transform: scale(1.05);
}

&.interactive:hover {
// background-color: #ffe7ba;
border: 2px solid #13c2c2;
transform: scale(1.05);
}
`;

export const SubscriptionCard = props => {
  const { onClick, title, description, icon, price, unit, active, interactive } = props;

  const classNameArray = [];
  if (active) {
    classNameArray.push('subscription-active');
  }
  if (interactive) {
    classNameArray.push('interactive');
  }

  return <IconContext.Provider value={{ size: '3rem' }}>
    <StyledCard
      className={classNameArray.join(' ')}
      title={<>
        {/* {icon} */}
        <div style={{ textTransform: 'uppercase', fontSize: 14 }}>{title}</div>
      </>}
      hoverable={interactive && !active}
      onClick={onClick}
      size="large"
    // bodyStyle={{backgroundColor: bgColor}}
    // headerStyle={{backgroundColor: bgColor}}
    >
      {active && <Text strong type="success" style={{ position: 'absolute', right: 8, bottom: 4 }}>Current plan</Text>}
      <Card.Meta
        title={<div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* <Text style={{ fontSize: '2.2rem', margin: '0 4px', color: '#13c2c2' }}><sup><small>$</small></sup> {price}</Text> */}
          <div>
            <MoneyAmount style={{ fontSize: '2.2rem', margin: '0 4px' }} value={price} />
          </div>
          <Text style={{ fontSize: 14 }} type="secondary">{unit}</Text>
          <Divider />
        </div>}
        description={description}
      ></Card.Meta>
    </StyledCard>
  </IconContext.Provider>
}

SubscriptionCard.propTypes = {
  title: PropTypes.any.isRequired,
  description: PropTypes.any,
  price: PropTypes.number.isRequired,
  unit: PropTypes.any.isRequired,
  active: PropTypes.bool,
  interactive: PropTypes.bool,
};

SubscriptionCard.defaultProps = {
  active: false,
  interactive: true,
};
