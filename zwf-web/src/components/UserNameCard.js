
import { Space, Skeleton, Tooltip, Row, Col, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { finalize } from 'rxjs';
import { getUserNameCardInfo$ } from 'services/userService';
import { getUserDisplayName } from 'util/getUserDisplayName';
import { UserAvatar } from './UserAvatar';
import { UserDisplayName } from './UserDisplayName';
import { ClickToEditInput } from './ClickToEditInput';

const { Text } = Typography;

export const UserNameCard = React.memo((props) => {
  const { userId, searchText, size, fontSize, showTooltip, showName, showEmail, showAvatar, type } = props;

  const [data, setData] = React.useState();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (userId) {
      const sub$ = getUserNameCardInfo$(userId)
        .pipe(
          finalize(() => setLoading(false))
        ).subscribe(x => {
          setData(x)
          setLoading(false)
        });
      return () => sub$.unsubscribe();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const icon = React.useMemo(() => {
    let ret = '';
    if (data) {
      if (data.givenName) {
        ret += data.givenName[0].toUpperCase();
        if (data.surname) {
          ret += data.surname[0].toUpperCase();
        }
      }
    }

    return ret || null;
  }, [data]);


  if (loading || !data) {
    return <Space size="small">
      {showAvatar && <Skeleton.Avatar active={loading} size={size} shape="circle" />}
      {showName && loading ? <Skeleton.Input style={{ width: 180 }} active={true} size={size} /> : <Text type="secondary">No user</Text>}
    </Space>
  }

  const contentComponent = <Space size="small" wrap={false} gutter={8} align="center" onClick={props.onClick}>
    {showAvatar &&
      <UserAvatar value={data.avatarFileId} color={data.avatarColorHex} size={size} fallbackIcon={icon} />
    }
    {(showName || showEmail) ? <UserDisplayName
      surname={data.surname}
      givenName={data.givenName}
      email={data.email}
      searchText={searchText}
      showEmail={showEmail}
      size={fontSize}
      type={type}
    />
      : null}
  </Space>


  return showTooltip ?
    <Tooltip title={getUserDisplayName(data.email, data.givenName, data.surname)} placement='bottom'>{contentComponent}</Tooltip> :
    contentComponent;
});

UserNameCard.propTypes = {
  userId: PropTypes.string,
  searchText: PropTypes.string,
  type: PropTypes.oneOf(['link']),
  size: PropTypes.number,
  fontSize: PropTypes.number,
  showTooltip: PropTypes.bool,
  showName: PropTypes.bool,
  showEmail: PropTypes.bool,
  showAvatar: PropTypes.bool,
};

UserNameCard.defaultProps = {
  searchText: '',
  size: 36,
  fontSize: 14,
  showTooltip: false,
  showName: true,
  showEmail: true,
  showAvatar: true,
};