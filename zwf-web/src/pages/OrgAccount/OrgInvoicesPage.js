import { Typography, Row, Col } from 'antd';
import React from 'react';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import loadable from '@loadable/component'
import { OrgSubscriptionHistoryPanel } from './OrgSubscriptionHistoryPanel';
import { listMySubscriptions$ } from 'services/subscriptionService';
import { finalize } from 'rxjs/operators';
import { PageContainer } from '@ant-design/pro-components';

const PaymentStepperWidget = loadable(() => import('components/checkout/PaymentStepperWidget'));

const { Paragraph, Text, Title, Link: TextLink } = Typography;


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


const StyledRow = styled(Row)`
  // margin-top: 20px;
  // margin-left: auto;
  // margin-right: auto;
`;

const StyledCol = styled(Col)`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const OrgInvoicesPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [billingHistory, setBillingHistory] = React.useState([]);

  React.useEffect(() => {
    const sub$ = listMySubscriptions$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(data => setBillingHistory(data));

    // const x$ = searchMyTicketUsage$(moment().toDate(), moment().add(17, 'day').toDate()).subscribe(d => {
    //   debugger;
    //   const ok = d;
    // });

    return () => {
      sub$.unsubscribe();
    }
  }, []);


  return (
    <ContainerStyled>
      <PageContainer
        header={{
          title: 'Invoices',
        }}
      >
      <Loading loading={loading} style={{ width: '100%' }}>
          <OrgSubscriptionHistoryPanel data={billingHistory} />
          </Loading>

      </PageContainer>
    </ContainerStyled>
  );
};

OrgInvoicesPage.propTypes = {};

OrgInvoicesPage.defaultProps = {};

export default OrgInvoicesPage;
