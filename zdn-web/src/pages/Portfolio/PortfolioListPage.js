import React from 'react';
import styled from 'styled-components';
import { Typography, Layout } from 'antd';

import { withRouter } from 'react-router-dom';
import * as queryString from 'query-string';
import PortfolioList from './PortfolioList';

const { Title, Paragraph, Link } = Typography;

const ContainerStyled = styled.div`
margin: 6rem auto 2rem auto;
padding: 0 1rem;
width: 100%;
max-width: 600px;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
 margin-bottom: 1rem;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;


const PortfolioListPage = props => {

  const { create } = queryString.parse(props.location.search);

  return (
    <LayoutStyled>
      
      <ContainerStyled>
        <StyledTitleRow>
          <Title level={2} style={{ margin: 'auto' }}>Portfolios</Title>
        </StyledTitleRow>
        <Paragraph>Client register as user in our platform to authorise Ziledin to be the accountant and tax agent to deal with all the task set up in each portfolio which is under the user’s name. The task can be set up either by client itself or Ziledin according to engagement letter.</Paragraph>
        <Paragraph>One user can authorise multiple portfolios and the user may be different from each portfolio’s person or director/public officer of an entity. All the correspondents between each user and us regarding all portfolios are confirmed by email which is register at the same time as the user.</Paragraph>
        <Paragraph>Please refer to our <Link target="_blank" href="/terms_and_conditions">term and conditions</Link> for further more details to use our platform.</Paragraph>

        <PortfolioList createMode={Boolean(create)}/>
      </ContainerStyled>
    </LayoutStyled >
  );
};

PortfolioListPage.propTypes = {};

PortfolioListPage.defaultProps = {};

export default withRouter(PortfolioListPage);
