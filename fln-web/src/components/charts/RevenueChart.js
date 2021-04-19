
import React from "react";
import PropTypes from "prop-types";
import { Line, Column } from '@ant-design/charts';
import ReactDOM from 'react-dom';
import { Loading } from "components/Loading";

const RevenueChart = props => {

  const { value } = props;
  const [data, setData] = React.useState([]);

  React.useEffect(()=> {
    const list = [];
    for(const item of value) {
      list.push(
        {
          time: item.time,
          value: +item.revenue,
          type: 'revenue'
        },
        {
          time: item.time,
          value: +item.profit,
          type: 'profit'
        },      {
          time: item.time,
          value: +item.credit,
          type: 'credit'
        }
      )
    };
    setData(list);
  }, [value]);

  const config = {
    data: data,
    xField: 'time',
    yField: 'value',
    seriesField: 'type',
    isPercent: true,
    isStack: true,
    label: {
      position: 'middle',
      content: function content(item) {
        return item.value.toFixed(2);
      },
      style: { fill: '#000' },
    },
    color: ['#55B0D4', '#d7183f', '#fa8c16'],
    // xAxis: { type: 'time' },
    yAxis: {
      label: {
        formatter: (v) => {
          return `$ ${(+v).toLocaleString()}`;
        },
      },
    },
  };

  return <Line {...config} />
  // return <Column {...config} />
}

RevenueChart.propTypes = {
  value: PropTypes.array.isRequired,
};

RevenueChart.defaultProps = {
};

export default RevenueChart;
