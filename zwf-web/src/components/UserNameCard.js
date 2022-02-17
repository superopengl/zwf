
import { Space, Skeleton, Tooltip } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { getUserNameCardInfo$ } from 'services/userService';
import { getUserDisplayName } from 'util/getDisplayName';
import { UserAvatar } from './UserAvatar';
import { UserDisplayName } from './UserDisplayName';

export const UserNameCard = React.memo((props) => {
  const { userId, searchText, size, showTooltip } = props;

  const [data, setData] = React.useState();

  React.useEffect(() => {
    if(userId) {
      const sub$ = getUserNameCardInfo$(userId).subscribe(x => {
        setData(x)
      });
      return () => sub$.unsubscribe();
    }
  }, [userId]);

  if (!data) {
    return <Space size="small">
      <Skeleton.Avatar active={true} size={size} shape="circle" />
      <Skeleton.Input style={{ width: 180 }} active={true} size={size} />
    </Space>
  }

  const contentComponent = <Space size="small">
    <UserAvatar value={data.avatarFileId} color={data.avatarColorHex} size={size} />
    <UserDisplayName
      surname={data.surname}
      givenName={data.givenName}
      email={data.email}
      searchText={searchText}
    />
  </Space>


  return showTooltip ?
    <Tooltip title={getUserDisplayName(data.email, data.givenName, data.surname)} placement='bottom'>{contentComponent}</Tooltip> :
    contentComponent;
});

UserNameCard.propTypes = {
  userId: PropTypes.string,
  searchText: PropTypes.string,
  size: PropTypes.number,
  showTooltip: PropTypes.bool,
};

UserNameCard.defaultProps = {
  searchText: '',
  size: 32,
  showTooltip: false,
};