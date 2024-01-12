import { Select, Typography, Button, Space } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { listOrgExistingClients } from 'services/orgService';
import { UserDisplayName } from 'components/UserDisplayName';
import isEmail from 'validator/lib/isEmail';
import Icon, { BorderOutlined, FileOutlined, UserOutlined } from '@ant-design/icons';
import { UserAvatar } from './UserAvatar';

const { Text } = Typography;

const StyledSelect = styled(Select)`
  .ant-select-selector {
    height: 50px !important;
    padding-top: 4px !important;
    padding-bottom: 4px !important;
    // display: flex;
    // align-items: center;
  }

  .ant-select-selection-search,.ant-select-selection-item {
    display: flex;
    align-items: center;
  }

  .ant-select-selection-placeholder {
    margin-top: 6px;
  }
`;

const ClientSelect = (props) => {
  const { value, onChange, onLoadingChange, ...other } = props;

  const [clientList, setClientList] = React.useState([]);
  const [searchText, setSearchText] = React.useState();
  const [isValidEmail, setIsValidEmail] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    onLoadingChange(true);
    const subscription$ = listOrgExistingClients()
      .subscribe(resp => {
        setClientList(resp?.data ?? [])
        onLoadingChange(false)
      })
    return () => {
      subscription$.unsubscribe();
    }
  }, []);

  React.useEffect(() => {
    setIsValidEmail(searchText && isEmail(searchText));
  }, [searchText])

  const handleChange = value => {
    // onChange(value);
  }

  const handleSelect = (value) => {
    const item = clientList.find(x => x.email === value);
    onChange(item);
  }

  const handleNewEmailInput = () => {
    onChange({
      email: searchText,
    });
    ref?.current?.blur();
  }

  return (
    <StyledSelect
      ref={ref}
      showSearch
      allowClear
      placeholder={<>Search a client by name or email</>}
      // optionFilterProp="searchText"
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={val => setSearchText(val)}
      filterOption={(input, option) => {
        const { givanName, surname, email } = option.item;
        return email?.includes(input) || givanName?.includes(input) || surname?.includes(input);
      }}
      notFoundContent={
        isValidEmail ? <Space>
          Seems like this email isn't a client in your organization.
          <Button
            type="primary"
            onClick={handleNewEmailInput}
          >Click to invite by this email</Button>
        </Space> : <>User not found. Typing in a valid email address can invite a user client.</>
      }
      {...other}
    >
      {clientList.map(c => (<Select.Option key={c.email} value={c.email} item={c}>
        <UserDisplayName
          surname={c.surname}
          givenName={c.givenName}
          email={c.email}
          searchText={searchText}
        />
      </Select.Option>))}
    </StyledSelect>
  )
};

ClientSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
};

ClientSelect.defaultProps = {
  onLoadingChange: () => { }
};

export default ClientSelect;
