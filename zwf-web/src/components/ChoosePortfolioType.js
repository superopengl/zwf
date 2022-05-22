import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Modal, Space, Divider } from 'antd';
import { UserOutlined, TeamOutlined } from '@ant-design/icons';
import { listPortfolio, deletePortfolio } from 'services/portfolioService';
import { Card } from 'antd';
import PropTypes from 'prop-types';

const { Title } = Typography;




const StyledSpace = styled(Space)`
svg, h3 {
color: #183e91 !important;
}

.ant-card {
  border-color: #183e91;
}
`


const ChoosePortfolioType = props => {

  const { visible, onOk, onCancel } = props;

  const handleChoose = (type) => {
    onOk(type);
  }

  return (
    <Modal
      title="Please choose portfolio type"
      visible={visible}
      destroyOnClose={true}
      maskClosable={false}
      onOk={() => onCancel()}
      onCancel={() => onCancel()}
      footer={null}
      width="90vw"
      centered={false}
      style={{ maxWidth: 400 }}
    >
      <StyledSpace style={{ textAlign: 'center', width: '100%' }} size="small" direction="vertical">
        <Card
          title={null}
          hoverable={true}
          onClick={() => handleChoose('individual')}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <UserOutlined style={{ fontSize: '2rem' }} />
            <Title level={3}>Individual Portfolio</Title>
             For individual information like given name, surname, date of birth, etc.
              </Space>
        </Card>
        <Divider>or</Divider>
        <Card
          title={null}
          hoverable={true}
          onClick={() => handleChoose('business')}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <TeamOutlined style={{ fontSize: '2rem' }} />
            <Title level={3}>Business Portfolio</Title>
              For organisation or compnay information like company name, ACN, ABN, etc.
              </Space>
        </Card>
      </StyledSpace>
    </Modal>
  );
};

ChoosePortfolioType.propTypes = {
  visible: PropTypes.bool.isRequired
};

ChoosePortfolioType.defaultProps = {
  visible: false
};

export default ChoosePortfolioType;
