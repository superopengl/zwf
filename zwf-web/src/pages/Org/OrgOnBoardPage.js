import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import { Logo } from 'components/Logo';
import { GlobalContext } from 'contexts/GlobalContext';
import SignUpForm from 'components/SignUpForm';
import OrgSignUpForm from 'pages/Org/OrgSignUpForm';
import OrgOnBoardWizard from './OrgOnBoardWizard';
import OrgOnBoardForm from './OrgProfileForm';
import { getAuthUser$ } from 'services/authService';

const { Title } = Typography;

const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  // background-color: #f3f3f3;
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

  const handleAfterOrgCreated = () => {
    getAuthUser$().subscribe(() => {
      props.history.push('/task');
    });
  }


  return <Container>
    <InnerContainer>
      <Logo />
      <Title level={2} style={{ margin: '2rem auto' }}>
        Organisation Profile
      </Title>
      <OrgOnBoardForm onOk={handleAfterOrgCreated} />
    </InnerContainer>
  </Container>
}

OrgOnBoardPage.propTypes = {};

OrgOnBoardPage.defaultProps = {};

export default withRouter(OrgOnBoardPage);
