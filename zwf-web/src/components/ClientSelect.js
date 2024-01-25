import PropTypes from 'prop-types';
import React from 'react';
import { map } from 'rxjs/operators';
import { listOrgExistingClients$ } from 'services/orgService';
import { UserSelect } from './UserSelect';


const ClientSelect = (props) => {
  const { value, valueProp, onChange, allowInput } = props;
  const [dataSource, setDataSource] = React.useState([]);

  React.useEffect(() => {
    const sub$ = listOrgExistingClients$().pipe(
      map(resp => resp.data)
    ).subscribe(setDataSource);
    return () => sub$.unsubscribe();
  }, [])

  return <UserSelect
    value={value}
    dataSource={dataSource}
    allowInput={allowInput}
    valueProp={valueProp}
    onChange={onChange}
    placeholder={allowInput ? 'Search a client by name or email or input a new email address' : 'Select a client by name or email'}
  />
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

export default ClientSelect;
