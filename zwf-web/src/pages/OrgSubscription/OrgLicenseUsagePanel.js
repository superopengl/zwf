import { Card, Button, Modal, Space, Typography, Tag, List, Tooltip, Row, Col } from 'antd';
import React from 'react';

import { Loading } from 'components/Loading';
import { CloseCircleFilled, CloseOutlined, LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { deleteOrgPaymentMethod$, listOrgPaymentMethods$, setOrgPrimaryPaymentMethod$ } from 'services/orgPaymentMethodService';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import { saveOrgPaymentMethod$ } from 'services/orgPaymentMethodService';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { finalize, switchMap } from 'rxjs';
import { useAddPaymentMethodModal } from 'components/useAddPaymentMethodModal';
import { getCurrentPeriod$, getPeriodUsage$, getSiblingPeriod$ } from '../../services/billingService';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { OrgPeriodUsageChart } from './OrgPeriodUsageChart';
import moment from 'moment';
import { ProCard } from '@ant-design/pro-components';

const { Title, Text, Paragraph } = Typography;

const Container = styled.div`
width: 100%;
min-width: 400px;
display: flex;
justify-content: center;
`

export const OrgLicenseUsagePanel = () => {

  const [loading, setLoading] = React.useState(true);

  const [period, setPeriod] = React.useState();
  const [hasPrevious, setHasPrevious] = React.useState(true);
  const [hasNext, setHasNext] = React.useState(true);

  React.useEffect(() => {
    const sub$ = getCurrentPeriod();
    return () => sub$.unsubscribe();
  }, []);

  const getCurrentPeriod = () => {
    setLoading(true);
    const sub$ = getCurrentPeriod$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe((period) => {
        setPeriod(period)
        setHasNext(false);
      })
    return sub$;
  }

  const getSiblingPeriod = (direction) => {
    setLoading(true);
    const sub$ = getSiblingPeriod$(period.id, direction)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(siblingPeriodId => {
        const hasSibling = !!siblingPeriodId;
        if (direction === 'previous') {
          setHasPrevious(hasSibling);
        } else if (direction === 'next') {
          setHasNext(hasSibling)
        }
        if (hasSibling) {
          setPeriod(siblingPeriodId);
        }
      })
    return sub$;
  }

  if (!period) {
    return <Loading />
  }

  return (
    <Container>
      <Row wrap={false} style={{ width: '100%' }} align="middle" gutter={20}>
        <Col>
          <Tooltip title={hasPrevious ? 'Previous billing period' : 'No more previous period'}>
            <Button shape="circle"
              type="primary"
              ghost
              onClick={() => getSiblingPeriod('previous')} icon={<LeftOutlined />} size="large"
              disabled={!hasPrevious}
            />
          </Tooltip>
        </Col>
        <Col flex="auto">
          <ProCard gutter={[20, 20]} ghost direction='column'>
            <ProCard title="Billing period">
              {moment(period.periodFrom).format('MMM DD YYYY')} - {moment(period.periodTo).format('MMM DD YYYY')} ({period.periodDays} days)
            </ProCard>
            <ProCard title="Payment">
              {period.type !== 'trial' ? '14 Day Free Trial' :
                !period.payment ? <>Pending Payment. The subsequent automatic deduction is scheduled for <Text strong>{moment(period.periodTo).format('MMM DD YYYY')}</Text>. Please kindly ensure that the primary payment method is valid and has enough balance.</> : <>
                  <DebugJsonPanel value={period.payment} />
              </>}
          </ProCard>
          <ProCard title="Usage">
            <OrgPeriodUsageChart period={period} />
          </ProCard>
        </ProCard>
      </Col>
      <Col>
        <Tooltip title={hasNext ? 'Next billing period' : 'No more next period'}>
          <Button shape="circle"
            type="primary"
            ghost
            onClick={() => getSiblingPeriod('next')} icon={<RightOutlined />} size="large"
            disabled={!hasNext}
          />
        </Tooltip>
      </Col>
    </Row>
    </Container >
  );
};

OrgLicenseUsagePanel.propTypes = {};

OrgLicenseUsagePanel.defaultProps = {};

