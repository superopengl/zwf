import PropTypes from 'prop-types';
import React from 'react';
import { searchOrgClientUsers$ } from 'services/clientService';
import { UserSelect } from './UserSelect';
import { useDebounce } from "rooks";
import { Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export const ClientSelect = (props) => {
  const { value, valueProp, onChange, allowInput } = props;
  const [dataSource, setDataSource] = React.useState([]);

  React.useEffect(() => {
    const sub$ = load$();
    return () => sub$.unsubscribe();
  }, [])

  const load$ = (text) => {
    return searchOrgClientUsers$({ text }).subscribe(resp => {
      setDataSource(resp.data)
    })
  }

  const handleTextChange = useDebounce(text => {
    if (valueProp === 'email') {
      load$(text);
    }
  }, 500);

  const handleChange = (selectedItem) => {
    const propValue = selectedItem[valueProp];
    onChange(propValue, selectedItem);
  }

  return <>
    <UserSelect
      value={value}
      dataSource={dataSource}
      allowInput={allowInput}
      valueProp={valueProp}
      onChange={handleChange}
      onTextChange={handleTextChange}
      placeholder={<><Avatar size={28} icon={<UserOutlined/>}/> {allowInput ? 'Search a client by name or email or input a new email address' : 'Select a client by name or email'}</>}
    />
  </>
};

ClientSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  valueProp: PropTypes.oneOf(['id', 'email']),
  allowInput: PropTypes.bool,
};

ClientSelect.defaultProps = {
  valueProp: 'id',
  allowInput: true,
};

