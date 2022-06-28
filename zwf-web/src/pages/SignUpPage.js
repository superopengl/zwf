import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import { Logo } from 'components/Logo';
import { GlobalContext } from 'contexts/GlobalContext';
import SignUpForm from 'components/SignUpForm';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';
import { useDocumentTitle } from 'hooks/useDocumentTitle';

const PageContainer = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  // background-color: #f3f3f3;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 360px;
  // background-color: #f3f3f3;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
`;

const SignUpPage = (props) => {

  useDocumentTitle('Individual user sign up')
  const navigate = useNavigate();

  return (
    <GlobalContext.Consumer>{
      () => {

        return <LayoutStyled>
          <PageContainer>
            <ContainerStyled>
              <Logo />
              <SignUpForm onOk={() => navigate('/')} />
            </ContainerStyled>
          </PageContainer>
        </LayoutStyled>;
      }
    }</GlobalContext.Consumer>

  );
}

SignUpPage.propTypes = {};

SignUpPage.defaultProps = {};

export default SignUpPage;
