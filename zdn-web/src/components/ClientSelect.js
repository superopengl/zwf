import { Select, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { listClients } from 'services/userService';
const { Text } = Typography;

const StyledPortfolioSelect = styled(Select)`
  .ant-select-selector {
    height: 50px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
  }

`;

const getDisplayName = (client) => {
  const displayName = `${client.givenName ?? ''} ${client.surname ?? ''}`.trim();
  return displayName || client.email;
}

const ClientSelect = (props) => {
  const { value, onChange, ...other } = props;

  const [clientList, setClientList] = React.useState([]);

  const loadEntity = async () => {
    const list = await listClients();
    setClientList(list);
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  return (
    <StyledPortfolioSelect allowClear value={value} onChange={onChange} {...other}>
      {clientList.map(c => (<Select.Option key={c.id} value={c.id}>
        <div style={{ display: 'flex', flexDirection: 'column', paddingTop: 5, paddingBottom: 5 }}>
          <div style={{ margin: 0, lineHeight: '1rem' }}>{getDisplayName(c)}</div>
          <Text style={{ margin: 0, lineHeight: '0.8rem' }} type="secondary"><small>{c.email}</small></Text>
        </div>
      </Select.Option>))}
    </StyledPortfolioSelect>
  )
};

ClientSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

ClientSelect.defaultProps = {
};

export default ClientSelect;
