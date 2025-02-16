import { Button, Space, Typography, Alert, Tooltip, Row, Col } from 'antd';
import React from 'react';

import { Loading } from 'components/Loading';
import { ClockCircleOutlined, DownloadOutlined, LeftOutlined, QuestionCircleOutlined, RightOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { finalize } from 'rxjs';
import { getCurrentPeriod$, getInvoiceUrl, getSiblingPeriod$ } from '../../services/billingService';
import { OrgPeriodUsageChart } from './OrgPeriodUsageChart';
import moment from 'moment';
import { ProCard } from '@ant-design/pro-components';
import MoneyAmount from 'components/MoneyAmount';
import { Descriptions } from 'antd';

const { Title, Text, Paragraph, Link: TextLink } = Typography;

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
        setHasPrevious(period.type !== 'trial');
      })
    return sub$;
  }

  const getSiblingPeriod = (direction) => {
    setLoading(true);
    const sub$ = getSiblingPeriod$(period.id, direction)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(siblingPeriod => {
        const hasSibling = !!siblingPeriod;
        if (direction === 'previous') {
          setHasPrevious(hasSibling);
          if (hasSibling) {
            setHasNext(true);
          }
        } else if (direction === 'next') {
          setHasNext(hasSibling)
          if (hasSibling) {
            setHasPrevious(true);
          }
        }
        if (hasSibling) {
          setPeriod(siblingPeriod);
        }
        if (siblingPeriod?.type === 'trial') {
          setHasPrevious(false);
        }
      })
    return sub$;
  }

  if (!period) {
    return <Loading />
  }

  return (
    <Container>
      <Row wrap={false} style={{ width: '100%' }} align="start" gutter={20}>
        <Col style={{ paddingTop: 10 }}>
          <Tooltip title={hasPrevious ? 'Previous billing period' : 'No more previous period'}>
            <Button
              type="text"
              onClick={() => getSiblingPeriod('previous')} icon={<LeftOutlined />} size="large"
              disabled={!hasPrevious}
            />
          </Tooltip>
        </Col>
        <Col flex="auto">
          <ProCard gutter={[20, 20]} ghost direction='column'>
            <ProCard title="Billing period">
              <ClockCircleOutlined /> {moment(period.periodFrom).format('MMM DD YYYY')} - <ClockCircleOutlined /> {moment(period.periodTo).format('MMM DD YYYY')} ({period.periodDays} days)
            </ProCard>
            {/* <DebugJsonPanel value={period} /> */}
            <ProCard title="Payment" extra={period.payment && <Button type="link" target="_blank" icon={<DownloadOutlined />} href={getInvoiceUrl(period.payment.invoiceFileId)}>Download Invoice</Button>}>
              {period.type === 'trial' ? <>
                <Paragraph>
                  Free for unlimited accounts during 14 Day Free Trial period.
                </Paragraph>
                <Paragraph>
                <Text strong>What will happen after the trial period ends?</Text><br/>
                Upon the conclusion of the trial period, the system will automatically transition to a monthly plan at a rate of AUD $39.00 per account per month (unless an alternative, agreed-upon price is in effect). The payment for the monthly plan will be processed on or after the last day of the period. For example, if a trial period ends on <Text underline>{moment(period.periodTo).format('MMM D YYYY')}</Text>, the first monthly plan will begin around <Text underline>{moment(period.periodTo).add(1, 'day').format('MMM D YYYY')}</Text>, and the initial payment will be processed around <Text underline>{moment(period.periodTo).add(1, 'month').add(-1, 'day').format('MMM D YYYY')}</Text>. Please note that the payment may be processed later than expected due to various reasons.
                </Paragraph>
              </> :
                !period.payment ? <>
                  <Paragraph>
                    Pending Payment. The subsequent automatic deduction is scheduled after <Text strong>
                      <ClockCircleOutlined /> {moment(period.periodTo).format('MMM DD YYYY')}
                    </Text>.
                    Please kindly ensure that the primary payment method is valid and has enough balance.
                  </Paragraph>
                  {period.promotionCode && <Alert
                    showIcon
                    type="success"
                    message="Discount eligiable"
                    description={<>Congratulations! Your organization is eligible for a discounted rate of <MoneyAmount value={period.promotionPlanPrice} strong underline /> per person-month, as opposed to the regular price of  <MoneyAmount value={period.planFullPrice} delete />.</>} />}
                </> : <>
                  <Row wrap={false} gutter={20} justify="space-between">
                    <Col span={8}>
                      <Space direction='vertical'>
                        <MoneyAmount value={period.payment?.payable} strong style={{ fontSize: 32, whiteSpace: 'nowrap' }} />
                        {period.promotionCode && 'Discount rate'}
                      </Space>
                    </Col>
                    <Col>
                      <Descriptions column={2}>
                        <Descriptions.Item label="Paid at">
                          {moment(period.checkoutDate).format('MMM DD YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Paid with">
                          Card ending with {period.payment.cardLast4}
                        </Descriptions.Item>
                        <Descriptions.Item label="Charged amount">
                          <Space>
                            <MoneyAmount value={period.payment.amount} delete={period.promotionCode} />
                            {period.promotionCode && <MoneyAmount value={period.payment.payable} strong />}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Plan price">
                          <Space>
                            <MoneyAmount value={period.planFullPrice} delete={period.promotionCode} postfix="/ mo" />
                            {period.promotionCode && <MoneyAmount value={period.promotionPlanPrice} strong postfix="/ mo" />}
                          </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Used units (user-days)">
                          {period.payment.payableDays}
                        </Descriptions.Item>
                        {period.promotionCode && <Descriptions.Item label="Promotion code">
                          {period.promotionCode}
                        </Descriptions.Item>}
                      </Descriptions>
                    </Col>
                  </Row>
                </>}
            </ProCard>
            <ProCard title="Usage" extra={<Tooltip title={<>
              The calculation of total usage during the billing period is based on user-days, representing the number of active members in your organization. To learn more about the usage calculation algorithm, click on this icon.
            </>}>
              <Button icon={<QuestionCircleOutlined />}
                type="link"
                href="/resource/5f3158de-671f-43f3-b250-85b8c0f2dd87"
                target="_blank"
              />
            </Tooltip>}>
              <OrgPeriodUsageChart period={period} />
            </ProCard>
          </ProCard>
        </Col>
        <Col style={{ paddingTop: 10 }}>
          <Tooltip title={hasNext ? 'Next billing period' : 'No more next period'}>
            <Button
              type="text"
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

