import React from 'react';
import styled from 'styled-components';
import { Typography, Layout } from 'antd';
import { Logo } from 'components/Logo';
import OrgProfileForm from './OrgProfileForm';
import { getAuthUser$ } from 'services/authService';
import { SupportAffix } from 'components/SupportAffix';
import HomeFooter from 'components/HomeFooter';
import { useSetAuthUser } from 'hooks/useSetAuthUser';

const { Title } = Typography;

const Container = styled(Layout)`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: #ffffff;
`;

const InnerContainer = styled.div`
  margin: 2rem auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
  height: 100%;
  // background-color: #f3f3f3;
`;



const OrgOnBoardPage = (props) => {
  const setAuthUser = useSetAuthUser();

  const handleAfterOrgCreated = () => {
    getAuthUser$().subscribe((user) => {
      setAuthUser(user);
    });
  }


  return <Container>
    <Layout.Content>
      <InnerContainer>
        <Logo />
        <Title level={2} style={{ margin: '2rem auto' }}>
          Setup Organization
        </Title>
        <OrgProfileForm onOk={handleAfterOrgCreated} mode="create" />
      </InnerContainer>
    </Layout.Content>
      <HomeFooter />
    <SupportAffix />
  </Container>
}

OrgOnBoardPage.propTypes = {};

OrgOnBoardPage.defaultProps = {};

export default OrgOnBoardPage;
