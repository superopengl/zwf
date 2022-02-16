import { Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { map } from 'rxjs/operators';
import { listOrgMembers$ } from 'services/memberService';
import { listOrgExistingClients$ } from 'services/orgService';
import { UserSelect } from './UserSelect';

const { Text } = Typography;


export const MemberSelect = (props) => {
  const { value, valueProp, onChange, onLoadingChange, allowInput } = props;

  const handleOnLoad = React.useCallback(() => {
    return listOrgMembers$();
  })

  return <UserSelect
    onLoad={handleOnLoad}
    value={value}
    allowInput={false}
    valueProp={'id'}
    onChange={onChange}
    onLoadingChange={onLoadingChange}
    placeholder={'Select a member by name or email'}
  />
};

MemberSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onLoadingChange: PropTypes.func,
};

MemberSelect.defaultProps = {
  onChange: () => {},
  onLoadingChange: () => { },
};

