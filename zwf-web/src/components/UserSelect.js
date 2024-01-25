import { Select, Typography, Button, Space } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { UserDisplayName } from 'components/UserDisplayName';
import isEmail from 'validator/lib/isEmail';
import { UserAvatar } from './UserAvatar';

const { Text } = Typography;

const StyledSelect = styled(Select)`
width: 100%;
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

export const UserSelect = React.memo((props) => {
  const { value, valueProp, placeholder, onChange, allowInput, dataSource, ...other } = props;

  const [userList, setUserList] = React.useState(dataSource);
  const [searchText, setSearchText] = React.useState();
  const [isValidEmail, setIsValidEmail] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    setUserList(dataSource);
  }, [dataSource])

  React.useEffect(() => {
    setIsValidEmail(searchText && isEmail(searchText));
  }, [searchText])

  const handleChange = value => {
    // onChange(value);
  }

  const handleSelect = (value) => {
    const item = userList.find(x => x[valueProp] === value);
    onChange(item);
  }

  const handleNewEmailInput = () => {
    onChange({
      email: searchText,
    });
    ref?.current?.blur();
  }

  const handleClear = () => {
    handleSelect(null);
  }

  return (
    <StyledSelect
      ref={ref}
      showSearch={allowInput}
      allowClear
      placeholder={placeholder}
      // optionFilterProp="searchText"
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={allowInput ? val => setSearchText(val) : null}
      onClear={handleClear}
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
      {userList.map(c => (<Select.Option key={c[valueProp]} value={c[valueProp]} item={c}>
        <Space size="small">
          <UserAvatar value={c.avatarFileId} color={c.avatarColorHex} size={28} />
          <UserDisplayName
            surname={c.surname}
            givenName={c.givenName}
            email={c.email}
            searchText={searchText}
          />
        </Space>
      </Select.Option>))}
    </StyledSelect>
  )
});

UserSelect.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  valueProp: PropTypes.oneOf(['id', 'email']),
  allowInput: PropTypes.bool,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
};

UserSelect.defaultProps = {
  valueProp: 'id',
  loading: false,
  allowInput: true,
};

