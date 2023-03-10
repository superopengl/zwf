import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { Logo } from 'components/Logo';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import HomeFooter from 'components/HomeFooter';
import { useOrgRegisterSuccessfullyModal } from 'components/useOrgRegisterSuccessfullyModal';

const { Title } = Typography;


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
margin: 1rem auto;
padding: 2rem 3rem;
text-align: center;
max-width: 460px;
// background-color: #ffffff;
border: 1px solid #E3E6EB;
border-radius: 8px;
`;


const LayoutStyled = styled(Layout)`
margin: 0 auto;
padding: 0;
background-color: #ffffff;
text-align: center;
min-height: 100%;
`;

const OrgSignUpPage = (props) => {
  const navigate = useNavigate();
  const [openSuccessModal, successContextHolder] = useOrgRegisterSuccessfullyModal()
  useDocumentTitle('Join by creating org')

  const handleOk = (email) => {
    openSuccessModal({
      email,
      onOk: () => navigate('/'),
      onCancel: () => navigate('/'),
    })
  }

  return <LayoutStyled>
    <Layout.Content style={{ padding: '3rem 1rem' }}>
      <Logo />
      <Title level={2}>New Organization</Title>
      <ContainerStyled>
        <OrgSignUpForm onOk={handleOk} />
      </ContainerStyled>
    </Layout.Content>
    <HomeFooter />
    {successContextHolder}
  </LayoutStyled>
}

OrgSignUpPage.propTypes = {};

OrgSignUpPage.defaultProps = {};

export default OrgSignUpPage;
