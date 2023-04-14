
import React from 'react';
import { Select } from 'antd';
import countryList from 'react-select-country-list'

const COUNTRY_LIST = countryList().getData();
const OPTIONS = COUNTRY_LIST.map((x, i) => <Select.Option key={i} value={x.value}>{x.label}</Select.Option>);

export const CountrySelector = props => {
  return (
    <Select {...props}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      defaultValue={props.defaultValue}
    >
      {OPTIONS}
    </Select>
  )
}