import React from 'react';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Layout } from 'antd';
import { Logo } from 'components/Logo';
import { GlobalContext } from 'contexts/GlobalContext';
import SignUpForm from 'components/SignUpForm';
import OrgSignUpForm from 'components/OrgSignUpForm';

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
  max-width: 600px;
  // background-color: #f3f3f3;
`;


const OrgOnBoardPage = (props) => {
  return <Container>
      <InnerContainer>
        <Logo />
        Org Setup
        <SignUpForm onOk={() => props.history.push('/')} />
      </InnerContainer>
    </Container>
}

OrgOnBoardPage.propTypes = {};

OrgOnBoardPage.defaultProps = {};

export default withRouter(OrgOnBoardPage);
