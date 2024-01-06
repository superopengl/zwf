import { Select, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { listOrgExistingClients } from 'services/orgService';
import { UserDisplayName } from './UserDisplayName';

const { Text } = Typography;

const StyledPortfolioSelect = styled(Select)`
  .ant-select-selector {
    height: 50px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    // display: flex;
    // align-items: center;
  }

  .ant-select-selection-search {
    display: flex;
    align-items: center;
  }

  .ant-select-selection-placeholder {
    margin-top: 6px;
  }
`;

const ClientSelect = (props) => {
  const { value, onChange, ...other } = props;

  const [clientList, setClientList] = React.useState([]);
  const [searchText, setSearchText] = React.useState();

  const loadEntity = () => {
    return listOrgExistingClients()
      .subscribe(resp => setClientList(resp?.data ?? []));
  }

  React.useEffect(() => {
    const subscription$ = loadEntity();
    return () => {
      subscription$.unsubscribe();
    }
  }, []);

  return (
    <StyledPortfolioSelect
      showSearch
      allowClear
      placeholder="Search by name or email"
      // optionFilterProp="searchText"
      value={value}
      onChange={onChange}
      onSearch={val => setSearchText(val)}
      filterOption={(input, option) => {
        const { givanName, surname, email } = option.item;
        return email?.includes(input) || givanName?.includes(input) || surname?.includes(input);
      }}
      {...other}
    >
      {clientList.map(c => (<Select.Option key={c.id} value={c.id} item={c}>
       <UserDisplayName
        surname={c.surname}
        givenName={c.givenName}
        email={c.email}
        searchText={searchText}
        />
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
