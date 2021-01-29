import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import FinalReviewStep from './FinalReviewStep';
import { Button } from 'antd';
import { Divider } from 'antd';

const MyTaskReadView = (props) => {
  const { value, showsSignDoc } = props;

  const handleOk = () => {
    props.history.goBack();
  }

  return (<>
    <FinalReviewStep task={value} showsFooter={false} showsSignDoc={showsSignDoc} />
    <Divider/>
    <Button block type="primary" onClick={handleOk}>OK</Button>
  </>
  );
};

MyTaskReadView.propTypes = {
  value: PropTypes.any.isRequired,
  showsSignDoc: PropTypes.bool.isRequired,
};

MyTaskReadView.defaultProps = {
  // id: 'new'
  showsSignDoc: true
};

export default withRouter(MyTaskReadView);
