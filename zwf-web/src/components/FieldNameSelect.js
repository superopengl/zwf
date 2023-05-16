import PropTypes from 'prop-types';
import React from 'react';
import { searchOrgClients$ } from 'services/clientService';
import { UserSelect } from './UserSelect';
import { useDebounce } from "rooks";
import { Avatar, Select, Button } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { EditDataBagContext } from 'contexts/EditDataBagContext';

export const FieldNameSelect = (props) => {
  const { value } = props;
  const { allNames, setAllNames } = React.useContext(EditDataBagContext);
  const [newName, setNewName] = React.useState();

  const handleCreateNew = () => {
    // console.log(newName)
  }

  return <>
    <Select
      value={value}
      options={allNames}
      // onChange={handleChange}
      placeholder="Select existing field or type to create new one"
      showSearch
      onInputKeyDown={handleCreateNew}
      onSearch={setNewName}
      notFoundContent={<Button type="primary" block onClick={handleCreateNew}>Create new field</Button>}
    />
  </>
};

FieldNameSelect.propTypes = {
  value: PropTypes.string,
  onCreateNew: PropTypes.func,
};

FieldNameSelect.defaultProps = {
};

