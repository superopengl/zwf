import React from 'react';
import styled from 'styled-components';
import { Row } from 'antd';

const Container = styled(Row)`
background-image: url("logo.png");
background-color: rgba(0, 32, 46,0.3);
// border: 0.5px white rgba(255,255,255,0.5);
border-radius: 4px;
width: 240px;
height: 64px;
padding: 1rem 1rem;
background-repeat: no-repeat;
background-position-x: right;
color: white;
font-size: smaller;

div {
  width: 100%;
}
`;

const PoweredByLogo = () => (
  <Container>
    <div>Partnered with</div>
    <div>iSouth Badminton</div>
    {/* <img src="logo.png" alt="logo" style={{ marginBottom: 2 }}></img> */}
  </Container>
);

PoweredByLogo.propTypes = {};

PoweredByLogo.defaultProps = {};

export default PoweredByLogo;
