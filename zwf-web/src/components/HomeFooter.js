import React from 'react';
import { Layout, Row, Col, Typography, Button, Space, Divider } from 'antd';
import styled from 'styled-components';
import { Image } from 'antd';
import { OrgRegisterInput } from './OrgRegisterInput';
// import GitInfo from 'react-git-info/macro';
import { Link, useNavigate } from 'react-router-dom';

const { Footer } = Layout;
const { Title, Text, Paragraph, Link: TextLink } = Typography;
// const gitInfo = GitInfo();
// const gitVersion = gitInfo.commit.shortHash;
const gitVersion = process.env.REACT_APP_GIT_HASH;

const FooterStyled = styled(Footer)`
width: 100%;
text-align: center;
font-size: 0.8rem;
color: #aaaaaa;
background-color: #13161B;
padding: 2rem 1rem;
// position: fixed;
// bottom: 0;
// left: 0;
// right: 0;
// min-height: 120px;

section {
  margin: 0 auto;
  max-width: 1000px;
}

h3.ant-typography {
  color: #ffffff;
  font-size: 14px;
  text-align: left;
  margin-bottom: 18px;
  font-weight: 700;
}

.ant-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
}

.ant-btn, .ant-typography {
  color: #D6DBE3BB;
  text-align: left;
}

.ant-btn:hover {
  background-color: #D6DBE333;
}

a {
  color: #aaaaaa;

  &:hover {
    text-decoration: underline;
  }
}

p {
  margin-bottom: 0;
}
`;

const span = {
  xs: 24,
  sm: 24,
  md: 24,
  lg: 12,
  xl: 12,
  xxl: 12
}

const HomeFooter = () => (
  <FooterStyled>
    <section>
      <Row justify="center" style={{ paddingBottom: '2rem' }} gutter={[48, 24]}>
        <Col {...span}>
          <Title level={3}>Unlock the Possibilities by Register Now</Title>
          <OrgRegisterInput />
        </Col>
        <Col flex="auto">
          <Row  gutter={[48, 24]}>
            <Col>
              <Title level={3}>Explore</Title>
              <Space direction='vertical' style={{ position: 'relative', left: -16 }}>
                <Button type="text" block>Key features</Button>
                <Button type="text" block>Pricing</Button>
                <Button type="text" block>Q&A</Button>
              </Space>
            </Col>
            <Col flex="auto">
              <Title level={3}>Contact Us</Title>
              <Space direction='vertical' style={{ position: 'relative', left: -16 }}>
                <TextLink href="mailto:customersupport@zeeworkflow.com.au">
                  <Button type="text" block>customersupport@zeeworkflow.com.au</Button>
                </TextLink>
              </Space>
            </Col>
          </Row>

        </Col>
      </Row>
    </section>
    <Row style={{ borderTop: '1px solid #D6DBE333' }}></Row>
    <section>
      <Row style={{ paddingTop: '2rem' }} align="middle" gutter={[48, 24]}>
        <Col {...span}>
          <Link to="/">
            <Image src="/images/logo-horizontal-blue.png" preview={false} height={32} />
          </Link>
        </Col>
        <Col flex="auto">
          <Space style={{ width: '100%' }}>
            <Text>©{new Date().getFullYear()} ZeeWorkflow</Text>
            <p style={{ display: 'none' }}>Version {gitVersion}</p>
            <a href="/privacy_policy" target="_blank"><Button type="text" >Privacy Policy</Button></a>
            <a href="/terms_and_conditions" target="_blank"><Button type="text" >Terms & Conditions</Button></a>
          </Space>
        </Col>
      </Row>
    </section>
  </FooterStyled >
);

HomeFooter.propTypes = {};

HomeFooter.defaultProps = {};

export default HomeFooter;
