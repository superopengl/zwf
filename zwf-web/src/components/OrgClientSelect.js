import { Select, Typography, Button, Space } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import isEmail from 'validator/lib/isEmail';
import { UserAvatar } from './UserAvatar';
import { UserNameCard } from './UserNameCard';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { searchOrgClientUsers$ } from 'services/clientService';
import { addClient$ } from 'services/authService';
import { finalize } from 'rxjs';

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

export const OrgClientSelect = (props) => {
  const { value, placeholder, onChange, onTextChange, allowInput, bordered, ...others } = props;

  const [clientList, setClientList] = React.useState([]);
  const [searchText, setSearchText] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const ref = React.useRef();

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe();
  }, [])

  const load$ = (text) => {
    setLoading(true)
    return searchOrgClientUsers$({ text })
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(resp => {
        setClientList(resp.data)
      })
  }

  React.useEffect(() => {
    onTextChange(searchText);
  }, [searchText])

  const handleChange = () => {
    // onTextChange(value);
  }

  const handleSelect = (value) => {
    const item = clientList.find(x => x.id === value);
    onChange(item);
  }

  const handleClear = () => {
    handleSelect(null);
  }

  // const handleKeyDown = e => {
  //   if (e.code === 'Enter') {
  //     onChange({
  //       email: searchText,
  //     });
  //   }
  // }

  const handleAddNewClient = () => {
    addClient$(searchText).pipe(
      finalize(() => setLoading(false)),
    ).subscribe({
      next: (newOrgClient) => {
        load$().add(() => {
          onChange(newOrgClient);
        })
      },
      error: e => { }
    })
  }

  return (<>
    <StyledSelect
      loading={loading}
      ref={ref}
      bordered={bordered}
      showSearch={allowInput}
      allowClear
      placeholder={<><Avatar size={28} icon={<UserOutlined />} /> {allowInput ? 'Search a client by name or email or input a new email address' : 'Select a client by name or email'}</>}
      // optionFilterProp="searchText"
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={allowInput ? val => setSearchText(val) : null}
      // onInputKeyDown={handleKeyDown}
      onClear={handleClear}
      filterOption={(input, option) => {
        const { clientAlias } = option.item;
        return clientAlias?.includes(input);
      }}
      notFoundContent={
        // isValidEmail
        //   ? `Seems like this email isn't a client in your organization. Click to invite this email.`
        //   : `User not found. Typing in a valid email address can invite a user client.`
        <Button block type="primary" onClick={handleAddNewClient}>Add New Client</Button>
      }
      {...others}
    >
      {clientList.map(c => (<Select.Option key={c.id} value={c.id} item={c}>
        <UserNameCard userId={c.userId} alias={c.clientAlias} />
      </Select.Option>))}
    </StyledSelect>
  </>
  )
};

OrgClientSelect.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.object,
  onChange: PropTypes.func,
  onTextChange: PropTypes.func,
  allowInput: PropTypes.bool,
  bordered: PropTypes.bool,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
};

OrgClientSelect.defaultProps = {
  loading: false,
  allowInput: true,
  bordered: true,
  onTextChange: () => { }
};

