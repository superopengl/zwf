
import { Space, Skeleton, Tooltip, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { getUserNameCardInfo$ } from 'services/userService';
import { getUserDisplayName } from 'util/getUserDisplayName';
import { UserAvatar } from './UserAvatar';
import { UserDisplayName } from './UserDisplayName';

export const UserNameCard = React.memo((props) => {
  const { userId, searchText, size, fontSize, showTooltip, showName, showEmail, showAvatar, type } = props;

  const [data, setData] = React.useState();

  React.useEffect(() => {
    if (userId) {
      const sub$ = getUserNameCardInfo$(userId).subscribe(x => {
        setData(x)
      });
      return () => sub$.unsubscribe();
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

  if (!data) {
    return <Space size="small">
      {showAvatar && <Skeleton.Avatar active={true} size={size} shape="circle" />}
      {showName && <Skeleton.Input style={{ width: 180 }} active={true} size={size} />}
    </Space>
  }

  const contentComponent = <Row size="small" wrap={false} gutter={8} align="top" onClick={props.onClick}>
    {showAvatar && <Col>
      <UserAvatar value={data.avatarFileId} color={data.avatarColorHex} size={size} fallbackIcon={icon} />
    </Col>}
    {(showName || showEmail) && <Col flex="auto"><UserDisplayName
      surname={data.surname}
      givenName={data.givenName}
      email={data.email}
      searchText={searchText}
      showEmail={showEmail}
      size={fontSize}
      type={type}
    />
    </Col>}
  </Row>


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