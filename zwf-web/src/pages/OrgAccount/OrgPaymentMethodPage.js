import React from 'react';

import styled from 'styled-components';
import { Loading } from 'components/Loading';
import OrgPaymentMethodPanel from './OrgPaymentMethodPanel';
import { listMySubscriptions$ } from 'services/subscriptionService';
import { finalize } from 'rxjs/operators';

const ContainerStyled = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-contents: center;


  .ant-spin-nested-loading {
    width: 100%;
  }

  // .ant-divider {
  //   margin: 20px 0 8px;
  // }
`;


const OrgPaymentMethodPage = () => {


  return (
    <ContainerStyled>
      <OrgPaymentMethodPanel />
    </ContainerStyled>
  );
};

OrgPaymentMethodPage.propTypes = {};

OrgPaymentMethodPage.defaultProps = {};

export default OrgPaymentMethodPage;