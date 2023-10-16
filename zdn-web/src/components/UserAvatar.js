import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Image } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { getFileMeta, getPublicFileUrl } from 'services/fileService';
import { Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import * as abbreviate from 'abbreviate';
import uniqolor from 'uniqolor';

const { Text } = Typography;

const Container = styled.div`
cursor: pointer;
position: relative;
padding: 8px;

.edit-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 9999999px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0,0,0,0.2);
  color: rgba(255,255,255,1);
}

&:hover {
  .edit-text {
    background-color: rgba(0,0,0,0.1);
    color: white;
  }
}
`;

function getLabel(givenName, surname) {
  const maxLength = 6;
  const words = [givenName, surname].filter(x => !!x);
  if (words.length === 1) {
    return abbreviate(words[0], { length: maxLength }).toUpperCase();
  }
  const initials = words.map(w => w.charAt(0).toUpperCase()).join('');
  return initials.substring(0, maxLength);
}

export const UserAvatar = React.memo((props) => {
  const { editable, size, value: avatarFileId, userId, givenName, surname, onChange, style } = props;

  const [fileList, setFileList] = React.useState([]);

  const load = async () => {
    if (avatarFileId) {
      const mata = await getFileMeta(avatarFileId);
      const fileList = [{
        uid: mata.id,
        name: mata.fileName,
        status: 'done',
        url: mata.location,
      }];
      setFileList(fileList);
    }
  }

  React.useEffect(() => {
    load()
  }, []);

  const handleChange = (info) => {
    const { file, fileList } = info;
    setFileList(fileList);

    if (file.status === 'done') {
      const newFileId = _.get(file, 'response.id', file.uid);
      onChange(newFileId);
    }
  };

  let avatarComponent = null;
  if (avatarFileId) {
    avatarComponent = <Avatar size={size} src={<Image
      alt="avatar"
      preview={false}
      src={getPublicFileUrl(avatarFileId)}
      fallback="/images/avatar-fallback.png"
    />} />
  } else {
    const { color: backgroundColor, isLight } = uniqolor(userId, { differencePoint: 160 });
    const color = isLight ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.85)';
    const name = getLabel(givenName, surname) || <UserOutlined />;
    const fontSize = 28 * size / 64;
    avatarComponent = <Avatar size={size} style={{ ...style, backgroundColor }}>
      <Text style={{ fontSize, color }}>{name}</Text>
    </Avatar>
  }

  if (!editable) {

    return <>{avatarComponent}</>
  }

  return (
    <Upload
      multiple={false}
      action={`${process.env.REACT_APP_ZDN_API_ENDPOINT}/file?public=1`}
      withCredentials={true}
      accept="image/*"
      showUploadList={false}
      fileList={fileList}
      onChange={handleChange}
    >
      <Container>
        {avatarComponent}
        <div className="edit-text">
          edit
        </div>
      </Container>
    </Upload>
  );
});

UserAvatar.propTypes = {
  userId: PropTypes.string,
  value: PropTypes.string, // avatarFileId
  givenName: PropTypes.string,
  surname: PropTypes.string,
  size: PropTypes.number,
  editable: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.any,
};

UserAvatar.defaultProps = {
  size: 64,
  editable: false,
};
