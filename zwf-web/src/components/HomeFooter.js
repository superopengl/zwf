import React from 'react';
import { Layout, Row, Col, Typography, Button, Space, Grid } from 'antd';
import styled from 'styled-components';
import { Image } from 'antd';
import { OrgRegisterInput } from './OrgRegisterInput';
// import GitInfo from 'react-git-info/macro';
import { Link, useNavigate } from 'react-router-dom';

const { Footer } = Layout;
const { Title, Text, Paragraph, Link: TextLink } = Typography;
const { useBreakpoint } = Grid;
// const gitInfo = GitInfo();
// const gitVersion = gitInfo.commit.shortHash;
const gitVersion = process.env.REACT_APP_GIT_HASH;

const FooterStyled = styled(Footer)`
width: 100%;
text-align: center;
font-size: 0.8rem;
color: #aaaaaa;
background-color: #13161B;
padding: 1em 1rem;
// position: absolute;
// bottom: 0;
// left: 0;
// right: 0;
// min-height: 120px;

section {
  margin: 0 auto;
  max-width: 1000px;
}

h3.ant-typography {
  color: #BCC4D0;
  font-size: 14px;
  text-align: left;
  margin-bottom: 18px;
  font-weight: 300;
}

.ant-col {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: left;
}

.ant-btn, .ant-typography {
  color: #FFFFFF;
  text-align: left;
}

.ant-btn:hover {
  background-color: #D6DBE333;
}

.copyright-button {
  cursor: default;

  &:hover {
    background-color: transparent;
  }
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

const manuSpan = {
  xs: 24,
  sm: 8,
  md: 8,
  lg: 8,
  xl: 8,
  xxl: 8
}

const HomeFooter = () => {
  const screens = useBreakpoint();

  return <FooterStyled>
    <section>
      <Row justify="center" style={{ paddingTop: '1rem', paddingBottom: '1rem' }} gutter={[8, 16]}>
        <Col flex="auto">
          <Row gutter={[48, 24]}>
            <Col>
              <Title level={3} style={{paddingLeft: 16}}>Explore</Title>
              <Space style={{ position: 'relative' }} direction={screens.xs ? 'vertical' : 'horizontal'} size={screens.xs ? 'small' : 'large'}>
                <Button type="link" href="/#features" block>Key features</Button>
                <Button type="link" href="/#pricing" block>Pricing</Button>
                <Button type="link" href="/#qa" block>Q&A</Button>
              </Space>
            </Col>
          </Row>
        </Col>
        <Col {...span} style={{paddingLeft: 18}}>
          <Title level={3}>Unlock the Possibilities by Register Now</Title>
          <OrgRegisterInput />
        </Col>
      </Row>
    </section>
    <Row style={{ borderTop: '1px solid #D6DBE333' }}></Row>
    <section>
      <Row style={{ paddingTop: '1rem' }} align="middle" gutter={[8, 16]}>
        <Col {...span}>
          <Link to="/">
            <Image style={{marginLeft: 10}} src="/images/logo-text-light.svg" preview={false} height={24} />
          </Link>
        </Col>
        <Col {...span}>
          <Space style={{ position: 'relative' }} direction={screens.xs ? 'vertical' : 'horizontal'} size={screens.xs ? 'small' : 'large'}>
            <Button type="text" className='copyright-button'>©{new Date().getFullYear()} ZeeWorkflow</Button>
            <Button type="link" href="/privacy_policy" target="_blank">Privacy Policy</Button>
            <Button type="link" href="/terms_and_conditions" target="_blank">Terms & Conditions</Button>
          </Space>
        </Col>
      </Row>
    </section>
    <p style={{ display: 'none' }}>Version {gitVersion}</p>
  </FooterStyled >
};

HomeFooter.propTypes = {};

HomeFooter.defaultProps = {};

export default HomeFooter;
