import { Select, Typography, Button, Space } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import isEmail from 'validator/lib/isEmail';
import { UserAvatar } from './UserAvatar';
import { UserNameCard } from './UserNameCard';

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

&.no-border {
  .ant-select-selector {
    padding-left: 0;
    padding-right: 0;
  }
}
`;

export const UserSelect = (props) => {
  const { value, valueProp, placeholder, onChange, onTextChange, allowInput, dataSource, bordered, ...others } = props;

  const [userList, setUserList] = React.useState(dataSource);
  const [searchText, setSearchText] = React.useState();
  const [isValidEmail, setIsValidEmail] = React.useState(false);
  const ref = React.useRef();

  React.useEffect(() => {
    setUserList(dataSource);
  }, [dataSource])

  React.useEffect(() => {
    setIsValidEmail(searchText && isEmail(searchText));
    onTextChange(searchText);
  }, [searchText])

  const handleChange = () => {
    // onTextChange(value);
  }

  const handleSelect = (value) => {
    const item = userList.find(x => x[valueProp] === value);
    onChange(item);
  }


  const handleClear = () => {
    handleSelect(null);
  }

  const handleKeyDown = e => {
    if (e.code === 'Enter') {
      onChange({
        email: searchText,
      });
    }
  }

  return (<>
    <StyledSelect
      ref={ref}
      bordered={bordered}
      className={bordered ? null : 'no-border'}
      showSearch={allowInput}
      allowClear
      placeholder={placeholder}
      // optionFilterProp="searchText"
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={allowInput ? val => setSearchText(val) : null}
      onInputKeyDown={handleKeyDown}
      onClear={handleClear}
      filterOption={(input, option) => {
        const { givanName, surname, email } = option.item;
        return email?.includes(input) || givanName?.includes(input) || surname?.includes(input);
      }}
      notFoundContent={
        // isValidEmail
        //   ? `Seems like this email isn't a client in your organization. Click to invite this email.`
        //   : `User not found. Typing in a valid email address can invite a user client.`
        <Button block type="primary" onClick={null}>Invite client with this email</Button>
      }
      {...others}
    >
      {userList.map(c => (<Select.Option key={c[valueProp]} value={c[valueProp]} item={c}>
        <UserNameCard userId={c[valueProp]} />
      </Select.Option>))}
    </StyledSelect>
  </>
  )
};

UserSelect.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.any,
  onChange: PropTypes.func,
  onTextChange: PropTypes.func,
  valueProp: PropTypes.oneOf(['id', 'email']),
  allowInput: PropTypes.bool,
  bordered: PropTypes.bool,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
};

UserSelect.defaultProps = {
  valueProp: 'id',
  loading: false,
  allowInput: true,
  bordered: true,
  onTextChange: () => { }
};

