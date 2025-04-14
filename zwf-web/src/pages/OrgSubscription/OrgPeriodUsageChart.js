import React from 'react';

import { Loading } from 'components/Loading';
import { finalize } from 'rxjs';
import { getPeriodUsage$ } from '../../services/billingService';
import { Bar } from '@ant-design/plots';
import PropTypes from 'prop-types';
import { getUserDisplayName } from 'util/getUserDisplayName';
import moment from 'moment';

const convertToDate = (m) => {
  return moment(m).format('DD/MMM');
}

export const OrgPeriodUsageChart = React.memo((props) => {

  const { id: periodId, periodFrom, periodDays } = props.period;

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

  const config = {
    data: list,
    xField: 'usage',
    yField: 'user',
    legend: false,
    xAxis: {
      min: 0,
      max: periodDays,
      grid: {
        line: {
          style: {
            lineDash: [2, 2],
            strokeOpacity: 0.7,
          }
        },
      },
      tickInterval: 1,
      label: {
        formatter: (text, item, index) => {
          const time = moment(rangeFrom).add(+text, 'day');
          if (index === 0 || index === periodDays - 1) {
            return time.format('D MMM YYYY')
          } else {
            return time.format('MMM D')
          }
        }
      }
    },
    isRange: false,
    color: '#0FBFC4',
    autoFit: true,
    padding: 'auto',
    maxBarWidth: 24,
    barStyle: {
      fill: 'l(0) 0:#0FBFC4 1:#0051D9',
      shadowColor: '#999999',
      shadowBlur: 10,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
    },
    meta: {
      usage: {
        min: 0,
        max: periodDays
      }
    },
    tooltip: {
      customContent: (text, item) => {
        const rawData = item?.[0]?.data?.raw;
        if (!rawData) return null;
        const { ticketFrom, ticketTo, ticketDays } = rawData;
        return <div>{convertToDate(ticketFrom)} - {convertToDate(ticketTo)} ({ticketDays} days) </div>;
      }
    },
    label: {
      position: 'middle',
      formatter: (item) => {
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
      {/* <DebugJsonPanel value={list} /> */}
    </Loading>
  );
});

OrgPeriodUsageChart.propTypes = {
  period: PropTypes.object.isRequired,
};

OrgPeriodUsageChart.defaultProps = {};

