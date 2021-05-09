import { Button, Space } from 'antd';
import React from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';


const StepButtonSet = (props) => {
  const {onBack, onNext, showsBack, loading} = props;

  const nextButtonProps = onNext ? {
    onClick: () => onNext()
  } : {
    htmlType: 'submit'
  }

  return <>
  <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 20 }}>
    <Button shape="circle" size="large" onClick={() => onBack()} icon={<LeftOutlined />} style={{visibility: showsBack ? 'visible' : 'hidden'}}></Button>
    {/* <Button onClick={() => onSkip()}>Skip</Button> */}
    <Button shape="circle" size="large" type="primary" icon={<RightOutlined />} disabled={loading} {...nextButtonProps}></Button>
  </Space></>
};

StepButtonSet.propTypes = {
};

StepButtonSet.defaultProps = {
  showsBack: true,
  loading: false
};

export default StepButtonSet;
