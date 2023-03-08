import { Card, Button, Modal, Space, Typography, Tag, List, Descriptions, Row, Col } from 'antd';
import React from 'react';

import { Loading } from 'components/Loading';
import { CloseCircleFilled, CloseOutlined, LeftOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { deleteOrgPaymentMethod$, listOrgPaymentMethods$, setOrgPrimaryPaymentMethod$ } from 'services/orgPaymentMethodService';
import StripeCardPaymentWidget from 'components/checkout/StripeCardPaymentWidget';
import { saveOrgPaymentMethod$ } from 'services/orgPaymentMethodService';
import { PageContainer, ProCard, ProList } from '@ant-design/pro-components';
import styled from 'styled-components';
import { useNavigate, Link } from 'react-router-dom';
import { finalize, switchMap } from 'rxjs';
import { useAddPaymentMethodModal } from 'components/useAddPaymentMethodModal';
import { getPeriodUsage$ } from '../../services/billingService';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { Bar } from '@ant-design/plots';
import PropTypes from 'prop-types';
import { getUserDisplayName } from 'util/getUserDisplayName';
import moment from 'moment';

const { Text, Paragraph } = Typography;

const Container = styled.div`
display: flex;
justify-content: center;
`

const convertToDate = (m) => {
  return moment(m).format('DD/MMM');
}

export const OrgPeriodUsageChart = React.memo((props) => {

  const { id: periodId, periodFrom, periodTo, periodDays } = props.period;

  const [loading, setLoading] = React.useState(true);

  const [list, setList] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    const sub$ = getPeriodUsage$(periodId)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(list => {
        setList(formatData(list));
      })
    return () => sub$.unsubscribe();

  }, [periodId]);

  const rangeFrom = moment(periodFrom).startOf('day');

  const formatData = (list) => {
    let userCounter = 0;
    return list.map(x => ({
      user: getUserDisplayName(x.email, x.givenName, x.surname) || `Deleted user ${++userCounter}`,
      usage: [
        moment(x.ticketFrom).startOf('day').diff(rangeFrom, 'days'),
        moment(x.ticketTo).endOf('day').diff(rangeFrom, 'days') + 1
      ],
      raw: x,
    }))
  }

  // const data = [
  //   {
  //     type: '分类一',
  //     values: [76, 100],
  //   },
  //   {
  //     type: '分类二',
  //     values: [56, 108],
  //   },
  // ];

  const config = {
    data: list,
    xField: 'usage',
    yField: 'user',
    legend: false,
    xAxis: {
      min: 0,
      max: periodDays,
      // minLimit: 0,
      // maxLimit: 31,
      grid: {

        line: {
          style: {
            lineDash: [2, 2]
            
          }
        },
      },
      tickInterval: 1,
      label: {
        formatter: (text, item, index) => {
          if (index === 0 || index === periodDays - 1) {
            return moment(+text).format('MMM D YYYY')
          } else {
            return moment(+text).format('D')
          }
        }
      }
    },
    isRange: false,
    color: '#0FBFC4',
    width: 700,
    maxBarWidth: 8,
    meta: {
      usage: {
        min: 0, //rangeFrom,
        max: periodDays, //rangeTo,
        // range: [rangeFrom, rangeTo]
      }
    },
    tooltip: {
      customContent: (text, item, index) => {
        const rawData = item?.[0]?.data?.raw;
        if (!rawData) return null;
        const { ticketFrom, ticketTo, ticketDays } = rawData;
        return <div>{convertToDate(ticketFrom)} - {convertToDate(ticketTo)} ({ticketDays} days) </div>;
      }
    },
    label: {
      position: 'top',
      formatter: (item, other) => {
        return item.raw.ticketDays;
      },
      layout: [
        {
          type: 'adjust-color',
        },
      ],
    },
  };

  return (
    <Loading loading={loading} >
      <Bar {...config} />
      <DebugJsonPanel value={list} />
    </Loading>
  );
});

OrgPeriodUsageChart.propTypes = {
  period: PropTypes.object.isRequired,
};

OrgPeriodUsageChart.defaultProps = {};

