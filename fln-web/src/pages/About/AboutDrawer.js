import { Typography, Row, Col, Drawer, Divider } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

const { Link, Paragraph } = Typography;

const StyledDrawer = styled(Drawer)`
color: rgba(255,255,255,0.65);
text-align: center;

.ant-typography, .ant-drawer-title {
  color: rgba(255,255,255,0.65);
}

.ant-drawer-header, .ant-drawer-wrapper-body {
  background-color: #00293d;
}

.ant-divider {
  border-top-color: rgba(255,255,255,0.05);
}
`;

const gitVersion = process.env.REACT_APP_GIT_HASH;

const AboutDrawer = (props) => {

  const { staticContext, ...other } = props;

  return (
    <StyledDrawer
      title="About EasyValueCheck"
      height="80vh"
      placement="bottom"
      destroyOnClose={false}
      maskClosable={true}
      {...other}
    >
      <Paragraph>
        About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck About EasyValueCheck
      </Paragraph>
      <Divider />
      <Paragraph>©{new Date().getFullYear()} Easy Value Check PTY LTD. All right reserved.</Paragraph>
      <Paragraph>Version {gitVersion}</Paragraph>
      <Paragraph><a href="/terms_and_conditions" target="_blank">Terms & Conditions</a> | <a href="/privacy_policy" target="_blank">Privacy Policy</a> </Paragraph>
      <Divider />
      Data is provided by IEX Cloud <a href="https://iexcloud.io" target="_blank" rel="noreferrer">https://iexcloud.io</a>
      {/* <Divider />
      <Link href="https://www.techseeding.com.au" target="_blank">
        Technical solution by TECHSEEDING PTY LTD.
        <br />https://www.techseeding.com.au
      <div style={{ marginTop: 5 }}><img src="https://www.techseeding.com.au/logo-bw.png" width="120px" height="auto" alt="Techseeding logo"></img></div>
      </Link> */}
    </StyledDrawer>
  );
};

AboutDrawer.propTypes = {};

AboutDrawer.defaultProps = {};

export default withRouter(AboutDrawer);
