
import React from "react";
import PropTypes from "prop-types";
import { Line } from '@ant-design/charts';
import { getStockPutCallRatioChart } from "services/stockService";
import ReactDOM from 'react-dom';
import { Loading } from "components/Loading";

const StockPutCallRatioChart = props => {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState([]);

  const formatData = data => {
    const chartData = [];
    for(const d of data) {
      const {date, putCallRatio, putCallRatioAvg90} = d;
      chartData.push({
        date,
        value: parseFloat(putCallRatio),
        type: 'daily putCallRatio'
      }, {
        date,
        value: parseFloat(putCallRatioAvg90),
        type: '90 days avg'
      });
    }
    return chartData;
  }

  const load = async () => {
    try {
      const data = await getStockPutCallRatioChart(props.symbol);
      ReactDOM.unstable_batchedUpdates(() => {
        setData(formatData(data));
        setLoading(false);
      })
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  const config = {
    data: data,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    xAxis: { type: 'time' },
    yAxis: {
      label: {
        formatter: function formatter(v) {
          return v?.toLocaleString();
        },
      },
    },
  };

  return <Loading loading={loading}>
    <Line {...config} />
    </Loading>
}

StockPutCallRatioChart.propTypes = {
  symbol: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
};

StockPutCallRatioChart.defaultProps = {
  width: 500
};

export default StockPutCallRatioChart;
