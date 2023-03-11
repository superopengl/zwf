import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { Logo } from 'components/Logo';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import HomeFooter from 'components/HomeFooter';
import { useOrgRegisterSuccessfullyModal } from 'hooks/useOrgRegisterSuccessfullyModal';
import { useAssertRole } from 'hooks/useAssertRole';

const { Title } = Typography;

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

const OrgSignUpPage = () => {
  useAssertRole(['guest']);
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
