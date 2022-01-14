import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Space, Typography, Layout } from 'antd';

import { getPortfolio, savePortfolio } from 'services/portfolioService';
import IndividualPortfolioForm from './IndividualPortfolioForm';

const { Title } = Typography;

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
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;


const PortfolioFormPage = (props) => {
  const { id, type: newType } = props.match.params;
  const isNew = !id;

  const [loading, setLoading] = React.useState(true);
  // const [name, setName] = React.useState('New Portfolio');
  // const [fields, setFields] = React.useState([]);

  const handleSubmit = async payload => {
    setLoading(true);
    await savePortfolio(payload);
    setLoading(false);
    props.history.push(`/portfolios`);
  }

  const handleCancel = () => {
    props.history.goBack();
  }

  // console.log('value', initialValues);

  return (<>
    <LayoutStyled>
      <ContainerStyled>
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>{`${isNew ? 'New' : 'Edit'} Portfolio`}</Title>
          </StyledTitleRow>
          <IndividualPortfolioForm
            loading={loading}
            id={id}
            type={newType}
            onCancel={() => handleCancel()}
            onOk={portfolio => handleSubmit(portfolio)}
          />
        </Space>
      </ContainerStyled>
    </LayoutStyled >
  </>
  );
};

PortfolioFormPage.propTypes = {
  id: PropTypes.string,
  defaultType: PropTypes.string,
};

PortfolioFormPage.defaultProps = {};

export default withRouter(PortfolioFormPage);
