import { Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { map } from 'rxjs/operators';
import { listOrgExistingClients$ } from 'services/orgService';
import { UserSelect } from './UserSelect';

const { Text } = Typography;


const ClientSelect = (props) => {
  const { value, valueProp, onChange, onLoadingChange, allowInput } = props;

  const handleOnLoad = React.useCallback(() => {
    return listOrgExistingClients$().pipe(
      map(resp => resp.data)
    );
  })

  return <UserSelect
    onLoad={handleOnLoad}
    value={value}
    allowInput={allowInput}
    valueProp={valueProp}
    onChange={onChange}
    onLoadingChange={onLoadingChange}
    placeholder={allowInput ? 'Search a client by name or email or input a new email address' : 'Select a client by name or email'}
  />
};

ClientSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
  valueProp: PropTypes.oneOf(['id', 'email']),
  allowInput: PropTypes.bool,
};

ClientSelect.defaultProps = {
  onLoadingChange: () => { },
  valueProp: 'id',
  allowInput: true,
};

export default ClientSelect;
