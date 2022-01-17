import { Typography } from 'antd';
import React from 'react';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';

const { Title } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
`;






const SystemBoardPage = props => {
  const [loading, setLoading] = React.useState(true);

  const loadList = async () => {
    setLoading(true);

    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, []);


  return (
    <LayoutStyled>
      System board page

    </LayoutStyled>
  )
}

SystemBoardPage.propTypes = {};

SystemBoardPage.defaultProps = {};

export default withRouter(SystemBoardPage);