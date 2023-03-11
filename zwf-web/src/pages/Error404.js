import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';
export const Error404 = props => {
  const navigate = useNavigate();
  const handleGoHome = () => {
    navigate('/');
  };

  return <Result
    status="error"
    title="404 Page Not Found"
    subTitle="Oops! The page you visited does not exist."
    extra={<Button type="link" onClick={handleGoHome}>Go Home</Button>}
  />
};

Error404.propTypes = {};

Error404.defaultProps = {};

