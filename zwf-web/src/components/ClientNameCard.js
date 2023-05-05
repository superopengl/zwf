
import { Space, Skeleton, Tooltip, Typography } from 'antd';
import PropTypes from 'prop-types';
import React from 'react';
import { finalize } from 'rxjs';
import { getUserDisplayName } from 'util/getUserDisplayName';
import { UserAvatar } from './UserAvatar';
import { getClientNameCardInfo$, refreshClientNameCardCache, saveClientAlias$ } from 'services/clientService';
import { ClickToEditInput } from './ClickToEditInput';
import { Avatar } from 'antd';
import Icon, { ProfileOutlined } from '@ant-design/icons';
import { ImProfile } from 'react-icons/im';
import { BsFillPersonVcardFill } from 'react-icons/bs';

const { Text } = Typography;

export const ClientNameCard = React.memo((props) => {
  const { id, size, showTooltip, allowChangeAlias, bordered } = props;

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

  const handleAliasChange = (newAlias) => {
    const formattedAlias = newAlias.trim();
    if (data.clientAlias !== formattedAlias) {
      saveClientAlias$(id, formattedAlias).subscribe({
        next: () => {
          refreshClientNameCardCache(id);
        }
      });
    }
  }

  if (loading || !data) {
    return <Space size="small">
      <Skeleton.Avatar active={loading} size={size} shape="circle" />
      {loading ? <Skeleton.Input style={{ width: 180 }} active={true} size={size} /> : <Text type="secondary">No user</Text>}
    </Space>
  }

  const fontSize = size * 14/ 36;

  const contentComponent = <Space size="small" wrap={false} gutter={8} align="center" onClick={props.onClick}>
    <UserAvatar value={data.avatarFileId} color={data.avatarColorHex} size={size} fallbackIcon={data.email ? null : <Icon style={{fontSize: fontSize }} component={BsFillPersonVcardFill} />} />
    {allowChangeAlias ?
      <div style={{ position: 'relative', left: -4, width: '100%' }}>
        <ClickToEditInput value={data.clientAlias} onChange={handleAliasChange} allowClear={false} size={fontSize} bordered={bordered} placeholder={"Client alias"}/>
      </div>
      : data.clientAlias}
  </Space>


  return showTooltip ?
    <Tooltip title={data.email ? `User: ${getUserDisplayName(data.email, data.givenName, data.surname)}` : 'Client profile'} placement='bottomLeft'>{contentComponent}</Tooltip> :
    contentComponent;
});

ClientNameCard.propTypes = {
  id: PropTypes.string,
  searchText: PropTypes.string,
  size: PropTypes.number,
  showTooltip: PropTypes.bool,
  allowChangeAlias: PropTypes.bool,
  bordered: PropTypes.bool,
};

ClientNameCard.defaultProps = {
  searchText: '',
  size: 36,
  showTooltip: false,
  allowChangeAlias: false,
  bordered: false,
};