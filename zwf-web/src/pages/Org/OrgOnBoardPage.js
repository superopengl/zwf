import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Typography } from 'antd';
import { Logo } from 'components/Logo';
import OrgProfileForm from './OrgProfileForm';
import { getAuthUser$ } from 'services/authService';

const { Title } = Typography;

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: #ffffff;
`;

const InnerContainer = styled.div`
  margin: 0 auto;
  padding: 2rem 1rem;
  text-align: center;
  max-width: 400px;
  height: 100%;
  // background-color: #f3f3f3;
`;



const OrgOnBoardPage = (props) => {
  const navigate = useNavigate();

  const handleAfterOrgCreated = () => {
    getAuthUser$().subscribe(() => {
      navigate('/task');
    });
  }


  return <Container>
    <InnerContainer>
      <Logo />
      <Title level={2} style={{ margin: '2rem auto' }}>
        Organization Profile
      </Title>
      <OrgProfileForm onOk={handleAfterOrgCreated} mode="create" />
    </InnerContainer>
  </Container>
}

OrgOnBoardPage.propTypes = {};

OrgOnBoardPage.defaultProps = {};

export default OrgOnBoardPage;
