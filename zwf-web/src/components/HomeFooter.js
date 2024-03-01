import React from 'react';
import { Layout, Row, Col } from 'antd';
import styled from 'styled-components';
import { Image } from 'antd';
// import GitInfo from 'react-git-info/macro';

const { Footer } = Layout;
// const gitInfo = GitInfo();
// const gitVersion = gitInfo.commit.shortHash;
const gitVersion = process.env.REACT_APP_GIT_HASH;

const FooterStyled = styled(Footer)`
width: 100%;
text-align: center;
font-size: 0.8rem;
color: #aaaaaa;
background-color: #000011;
padding-left: 1rem;
padding-right: 1rem;
position: fixed;
bottom: 0;
left: 0;
right: 0;

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

const HomeFooter = () => (
  <FooterStyled>
    <section id="about">
      <Row>
        <Col span={24}>
          <div></div>
          <p>©{new Date().getFullYear()} <a href="https://www.techseeding.com.au" target="_blank" rel="noopener noreferrer">Techseeding PTY LTD. All right reserved.</a></p>
          <p style={{ display: 'none' }}>Version {gitVersion}</p>
          <p><a href="/terms_and_conditions" target="_blank">Terms & Conditions</a> | <a href="/privacy_policy" target="_blank">Privacy Policy</a> </p>
        </Col>
      </Row>
      <Row style={{marginTop: 4}}>
        <Col span={24}>
          <div style={{ marginTop: 5 }}><img src="https://www.techseeding.com.au/logo-bw.png" width="120px" height="auto" alt="Techseeding logo"></img></div>
        </Col>
      </Row>
    </section>
  </FooterStyled>
);

HomeFooter.propTypes = {};

HomeFooter.defaultProps = {};

export default HomeFooter;
