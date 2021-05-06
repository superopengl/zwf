import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import { Logo } from 'components/Logo';
import { GlobalContext } from 'contexts/GlobalContext';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  color: rgba(255,255,255,0.85);
  background-color: #0e0040;
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 360px;
  height: 100%;
  // background-color: #ffffff;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  // background-color: rgba(76,27,179,0.1);
  height: 100%;
`;

const OrgSignUpPage = (props) => {

  return (
    <GlobalContext.Consumer>{
      () => {

        return <LayoutStyled>
          <PageContainer>
            <ContainerStyled>
              <Logo />
              <OrgSignUpForm onOk={() => props.history.push('/')} />
            </ContainerStyled>
          </PageContainer>
        </LayoutStyled>;
      }
    }</GlobalContext.Consumer>

  );
}

OrgSignUpPage.propTypes = {};

OrgSignUpPage.defaultProps = {};

export default withRouter(OrgSignUpPage);
