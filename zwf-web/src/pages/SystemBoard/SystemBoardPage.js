import { Typography } from 'antd';
import { useAssertRole } from 'hooks/useAssertRole';
import React from 'react';

import styled from 'styled-components';

const { Title } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
`;






const SystemBoardPage = props => {
  useAssertRole(['system']);
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

export default SystemBoardPage;