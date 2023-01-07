import React from 'react';
import { withRouter } from 'react-router-dom';
import { Result, Button } from 'antd';
const Error404 = props => {
  const handleGoBack = () => {
    props.history.goBack();
  };

  return <Result
    status="error"
    title="404 Page Not Found"
    subTitle="Oops! The page you visited does not exist."
    extra={<Button type="link" onClick={handleGoBack}>Go Back</Button>}
  />
};

Error404.propTypes = {};

Error404.defaultProps = {};

export default withRouter(Error404);
