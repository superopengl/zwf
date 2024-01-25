import PropTypes from 'prop-types';
import React from 'react';
import { subscribeMembers } from 'services/memberService';
import { UserSelect } from './UserSelect';

export const MemberSelect = (props) => {
  const { value, onChange } = props;

  const [dataSource, setDataSource] = React.useState([]);

  React.useEffect(() => {
    const sub$ = subscribeMembers(setDataSource);
    return () => sub$.unsubscribe();
  }, [])

  return <UserSelect
    value={value}
    dataSource={dataSource}
    allowInput={false}
    valueProp={'id'}
    onChange={onChange}
    placeholder={'Select a member by name or email'}
  />
};

MemberSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

MemberSelect.defaultProps = {
  onChange: () => { },
};

