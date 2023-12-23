import { Select, Space, Typography } from 'antd';
import { PortfolioAvatar } from 'components/PortfolioAvatar';
import PropTypes from 'prop-types';
import React from 'react';
import { listPortfolio } from 'services/portfolioService';
import styled from 'styled-components';
import ReactDOM from 'react-dom';

const { Text } = Typography;

const StyledPortfolioSelect = styled(Select)`
  .ant-select-selector {
    height: 50px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }
`;

const PortfolioSelect = (props) => {
  const { value, onChange, ...other } = props;

  const [, setLoading] = React.useState(true);
  const [portfolioList, setPortfolioList] = React.useState([]);

  const loadEntity = async () => {
    const portfolioList = await listPortfolio();
    ReactDOM.unstable_batchedUpdates(() => {
      setPortfolioList(portfolioList);
      setLoading(false);
    })
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  return (
    <StyledPortfolioSelect allowClear value={value} onChange={onChange} {...other}>
      {portfolioList.map((p, i) => (<Select.Option key={i} value={p.id}>
        <Space>
          <PortfolioAvatar value={p.name} id={p.id} size={40} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ margin: 0, lineHeight: '1rem' }}>{p.name}</div>
            <Text style={{ margin: 0, lineHeight: '0.8rem' }} type="secondary"><small>{p.email}</small></Text>
          </div>
        </Space>
      </Select.Option>))}
    </StyledPortfolioSelect>
  )
};

PortfolioSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

PortfolioSelect.defaultProps = {
};

export default PortfolioSelect;
