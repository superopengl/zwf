import { Button, Space, Typography, Alert, Tooltip, Row, Col, Divider } from 'antd';
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
import { useTerminateModal } from 'hooks/useTerminateModal';
import { useAuthUser } from 'hooks/useAuthUser';

const { Title, Text, Paragraph, Link: TextLink } = Typography;

const Container = styled.div`
width: 100%;
min-width: 400px;
display: flex;
justify-content: center;
flex-direction: column;
`

const TerminationCard = styled(ProCard)`
color: #F53F3F;
border: 1px solid #F53F3F44;
// background-color: #F53F3F11;
`;

export const OrgLicenseUsagePanel = () => {

  const [loading, setLoading] = React.useState(true);

  const [period, setPeriod] = React.useState();
  const [hasPrevious, setHasPrevious] = React.useState(true);
  const [hasNext, setHasNext] = React.useState(true);
  const [openTerminate, terminateContextHolder] = useTerminateModal();
  const [user] = useAuthUser();

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

  const handleTerminate = () => {
    openTerminate();
  }

  if (!period) {
    return <Loading />
  }

  const isOwner = user.orgOwner;

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
          <ProCard gutter={[30, 30]} ghost direction='column'>

            {/* <DebugJsonPanel value={period} /> */}
            <ProCard            >
              <Row justify="space-between" style={{ alignItems: 'end' }}>
                <Col>
                  <Title>ALL IN ONE PLAN</Title>
                </Col>
                <Col>
                  <Space style={{ alignItems: 'end' }}>
                    <MoneyAmount value={period.promotionPlanPrice ?? period.planFullPrice} strong style={{ color: '#0FBFC4', fontSize: 46 }} />
                    <Text type="secondary" style={{ position: 'relative', bottom: 12 }}>/ 1 user per month</Text>
                  </Space>
                </Col>
              </Row>
            </ProCard>
            <ProCard
              title="Billing"
              extra={period.payment && <Button type="link" target="_blank" icon={<DownloadOutlined />} href={getInvoiceUrl(period.payment.invoiceFileId)}>Download Invoice</Button>}
            >
              <div style={{ marginBottom: 16 }}>
                <ClockCircleOutlined /> {moment(period.periodFrom).format('D MMM YYYY')} - <ClockCircleOutlined /> {moment(period.periodTo).format('D MMM YYYY')} ({period.periodDays} days)
              </div>
              {period.type === 'trial' ? <>
                <Paragraph>
                  Free for unlimited accounts during 14 Day Free Trial period.
                </Paragraph>
                <Paragraph>
                  <Text strong>What will happen after the trial period ends?</Text><br />
                  Upon the conclusion of the trial period, the system will automatically transition to a monthly plan at a rate of AUD $49.00 per account per 30 days (unless an alternative, agreed-upon price is in effect). The payment for the monthly plan will be processed on or after the last day of the period. For example, if a trial period ends on <Text underline>{moment(period.periodTo).format('D MMM YYYY')}</Text>, the first monthly plan will begin from <Text underline>{moment(period.periodTo).add(1, 'day').format('D MMM YYYY')}</Text>, and the initial payment will be processed around <Text underline>{moment(period.periodTo).add(30, 'days').add(-1, 'day').format('D MMM YYYY')}</Text>. Please note that the payment may be processed later than expected due to various reasons.
                </Paragraph>
              </> : period.payment ? <Row wrap={false} gutter={20} justify="space-between" >
                <Col span={8}>
                  <Space direction='vertical'>
                    <MoneyAmount value={period.payment?.payable} strong style={{ fontSize: 32, whiteSpace: 'nowrap' }} />
                    {period.promotionCode && 'Discount rate'}
                  </Space>
                </Col>
                <Col>
                  <Descriptions column={2}>
                    <Descriptions.Item label="Paid at">
                      {moment(period.checkoutDate).format('D MMM YYYY')}
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
              </Row> : <>
                <Paragraph>
                  Pending Payment. The subsequent automatic deduction is scheduled after <Text strong>
                    <ClockCircleOutlined /> {moment(period.periodTo).format('D MMM YYYY')}
                  </Text>.
                  Please kindly ensure that the primary payment method is valid and has enough balance.
                </Paragraph>
                {period.promotionCode && <Alert
                  showIcon
                  type="success"
                  message="Negotiated price eligiable"
                  description={<>Your organization is eligible for a negotiated rate of <MoneyAmount value={period.promotionPlanPrice} strong underline /> per person-month, as opposed to the regular price of  <MoneyAmount value={period.planFullPrice} delete />.</>} />}
              </>}
            </ProCard>
            <ProCard title="Usage" extra={<Tooltip title={<>
              The calculation of total usage during the billing period is based on user-days, representing the number of active members in your organization. To learn more about the usage calculation algorithm, click on this icon.
            </>}>
              <Button icon={<QuestionCircleOutlined />}
                type="link"
                href="/resource/45a7740b-2403-47c6-89c4-43213161a5bf"
                target="_blank"
              />
            </Tooltip>}>
              <OrgPeriodUsageChart period={period} />
            </ProCard>
            {false && isOwner && <TerminationCard title="Termination" extra={
              <Button
                // type="primary"
                danger
                onClick={handleTerminate}
              >Terminate Subscription & Delete Org</Button>
            }>
              <Paragraph>
                Terminate the subscription and delete all accounts linked with this organization immediately. Please note that this action is irreversible. Additionally, for the sake of privacy protection, all assets exclusively linked to this organization will be permanently erased from ZeeWorkflow. We highly advise that you create a backup of all essential information before proceeding.
              </Paragraph>
            </TerminationCard>}
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
{terminateContextHolder}
    </Container >
  );
};

OrgLicenseUsagePanel.propTypes = {};

OrgLicenseUsagePanel.defaultProps = {};

