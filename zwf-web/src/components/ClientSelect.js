import PropTypes from 'prop-types';
import React from 'react';
import { map } from 'rxjs/operators';
import { searchOrgClientUsers$ } from 'services/userService';
import { UserSelect } from './UserSelect';

export const ClientSelect = React.memo((props) => {
  const { value, valueProp, onChange, allowInput } = props;
  const [dataSource, setDataSource] = React.useState([]);

  React.useEffect(() => {
    const sub$ = searchOrgClientUsers$().pipe(
      map(resp => resp.data)
    ).subscribe(setDataSource);
    return () => sub$.unsubscribe();
  }, [])

  const handleTextChange = text => {
    debugger;
  }

  return <UserSelect
    value={value}
    dataSource={dataSource}
    allowInput={allowInput}
    valueProp={valueProp}
    onChange={onChange}
    onTextChange={handleTextChange}
    placeholder={allowInput ? 'Search a client by name or email or input a new email address' : 'Select a client by name or email'}
  />
});

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

