import PropTypes from 'prop-types';
import React from 'react';
import { subscribeMembers } from 'services/memberService';
import { UserSelect } from './UserSelect';

export const MemberSelect = React.memo((props) => {
  const { value, onChange, bordered } = props;

  const [dataSource, setDataSource] = React.useState([]);

  React.useEffect(() => {
    const sub$ = subscribeMembers(setDataSource);
    return () => sub$.unsubscribe();
  }, [])

  const handleChange = selectedUser => {
    onChange(selectedUser?.id)
  }

  return <UserSelect
    value={value}
    dataSource={dataSource}
    allowInput={false}
    valueProp={'id'}
    onChange={handleChange}
    placeholder={'Select a member'}
    bordered={bordered}
  />
});

MemberSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  bordered: PropTypes.bool,
};

MemberSelect.defaultProps = {
  onChange: () => { },
  bordered: true
};

