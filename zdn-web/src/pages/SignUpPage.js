import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import { Logo } from 'components/Logo';
import { GlobalContext } from 'contexts/GlobalContext';
import SignUpForm from 'components/SignUpForm';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
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
  height: 100%;
`;

const SignUpPage = (props) => {

  return (
    <GlobalContext.Consumer>{
      () => {

        return <LayoutStyled>
          <PageContainer>
            <ContainerStyled>
              <Logo />
              <SignUpForm onOk={() => props.history.push('/')} />
            </ContainerStyled>
          </PageContainer>
        </LayoutStyled>;
      }
    }</GlobalContext.Consumer>

  );
}

SignUpPage.propTypes = {};

SignUpPage.defaultProps = {};

export default withRouter(SignUpPage);
