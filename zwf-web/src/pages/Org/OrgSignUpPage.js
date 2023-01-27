import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import { Logo } from 'components/Logo';
import { GlobalContext } from 'contexts/GlobalContext';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import HomeFooter from 'components/HomeFooter';

const PageContainer = styled.div`
  width: 100%;
  padding: 0;
  margin: 0 auto;
  // color: rgba(255,255,255,0.95);
  // background-color: #00474f;

  // .poster-patterns {
  //   background-image: url("images/logo-tile.png");
  //     background-repeat: repeat;
  //     background-size: 120px;
  //     opacity: 0.05;
  //     top: 0;
  //     left: 0;
  //     bottom: 0;
  //     right: 0;
  //     position: absolute;
  //   }
`;

const ContainerStyled = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 420px;
  // background-color: #ffffff;
`;


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  // background-color: rgba(19,194,194,0.1);
`;

const OrgSignUpPage = (props) => {
  const navigate = useNavigate();
  useDocumentTitle('Join by creating org')
  return <LayoutStyled>
    <PageContainer>
      <div className="poster-patterns" />
      <ContainerStyled>
        <Logo />
        <OrgSignUpForm onOk={() => navigate('/')} />
      </ContainerStyled>
    </PageContainer>
    <HomeFooter />

  </LayoutStyled>
}

OrgSignUpPage.propTypes = {};

OrgSignUpPage.defaultProps = {};

export default OrgSignUpPage;
