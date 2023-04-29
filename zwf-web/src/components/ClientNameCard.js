
import { Space, Skeleton, Tooltip, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { finalize } from 'rxjs';
import { getUserDisplayName } from 'util/getUserDisplayName';
import { UserAvatar } from './UserAvatar';
import { getClientNameCardInfo$ } from 'services/clientService';
import { ClickToEditInput } from './ClickToEditInput';

const { Text } = Typography;

export const ClientNameCard = React.memo((props) => {
  const { id, size, showTooltip, onAliasChange } = props;

  const [data, setData] = React.useState();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      const sub$ = getClientNameCardInfo$(id)
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
  }, [id]);

  if (loading || !data) {
    return <Space size="small">
      <Skeleton.Avatar active={loading} size={size} shape="circle" />
      {loading ? <Skeleton.Input style={{ width: 180 }} active={true} size={size} /> : <Text type="secondary">No user</Text>}
    </Space>
  }

  const contentComponent = <Space size="small" wrap={false} gutter={8} align="center" onClick={props.onClick}>
    <UserAvatar value={data.avatarFileId} color={data.avatarColorHex} size={size} />
    {onAliasChange ?
      <div style={{ position: 'relative', left: -4 }}><ClickToEditInput value={data.clientAlias} onChange={onAliasChange} allowClear={false} /></div>
      : data.clientAlias}
  </Space>


  return showTooltip ?
    <Tooltip title={data.email ? getUserDisplayName(data.email, data.givenName, data.surname) : 'Email not set'} placement='bottomLeft'>{contentComponent}</Tooltip> :
    contentComponent;
});

ClientNameCard.propTypes = {
  id: PropTypes.string,
  searchText: PropTypes.string,
  size: PropTypes.number,
  showTooltip: PropTypes.bool,
};

ClientNameCard.defaultProps = {
  searchText: '',
  size: 36,
  showTooltip: true,
};