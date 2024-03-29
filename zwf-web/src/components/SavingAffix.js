
import React from 'react';
import styled from 'styled-components';
import { Typography, Affix } from 'antd';
const { Text } = Typography;

const Container = styled.div`
padding: 0 2px 0 8px;
border-radius: 4px 0 0 0;
border: none;
background-color: #0FBFC466;
`;

export const SavingAffix = (props) => {
  return <Affix style={{ position: 'fixed', bottom: 0, right: 0 }}>
    <Container>
      <Text type="secondary" italic>saving...</Text>
    </Container>
  </Affix>
}
