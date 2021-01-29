import React from 'react';
import styled from 'styled-components';
import { Typography, Divider } from 'antd';
import { Logo } from 'components/Logo';
const ContainerStyled = styled.div`
padding: 2rem 1rem;
margin: 1rem auto;
text-align: left;
width: 100%;
max-width: 900px;
font-size: 0.9rem;

h2 {
  font-size: 1.3rem;
}

h3 {
  font-size: 1.1rem;
}
`;
const { Title } = Typography;
const DeclarationPage = () => (
  <ContainerStyled>
    <div style={{ width: '100%', textAlign: 'center', marginBottom: '2rem' }}><Logo /></div>
    <Title style={{ textAlign: 'center' }}>AU Accounting Office Pty Ltd Declaration</Title>
    <p>I declare that the information provided for the preparation of the task is true and correct.</p>
    <p>For the document where it is to be lodged to the ATO electronically. I, the business owner, authorise J.Z. Accounting trading as AU Accounting Office to give the e-signed document to the commissioner of Taxation. The agent is authorised to lodge this form.</p>
    <p>It is the responsibility of the taxpayer to retain this declaration for a period of five years after the declaration is made, penalties may apply for failure to do so.</p>

  </ContainerStyled>

);

DeclarationPage.propTypes = {};

DeclarationPage.defaultProps = {};

export default DeclarationPage;
