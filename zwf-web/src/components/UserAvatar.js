import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Image, Tooltip } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { getFileMeta, getFileMeta$, getPublicFileUrl } from 'services/fileService';
import { Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import * as abbreviate from 'abbreviate';
import uniqolor from 'uniqolor';
import { empty, EMPTY } from 'rxjs';

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

const StyledAvatar = styled(Avatar)`
border: 1px solid rgba(0,0,0,0.2);

.ant-avatar-string {
  // line-height: ${28}px !important;
}
`


export const UserAvatar = React.memo((props) => {
  const { editable, size, value: avatarFileId, onChange, style, color: backgroundColor } = props;

  const [fileList, setFileList] = React.useState([]);

  React.useEffect(() => {
    if(!editable) {
      return;
    }
    const subscription = load$();
    return () => {
      subscription.unsubscribe();
    }
  }, []);



  const load$ = () => {
    if (!avatarFileId) {
      return EMPTY.subscribe();
    }
    return getFileMeta$(avatarFileId).subscribe(mata => {
      const fileList = [{
        uid: mata.id,
        name: mata.fileName,
        status: 'done',
        url: mata.location,
      }];
      setFileList(fileList);
    })
  }

  let avatarComponent = null;
  if (avatarFileId) {
    avatarComponent = <StyledAvatar size={size} src={<Image
      alt="avatar"
      preview={false}
      src={getPublicFileUrl(avatarFileId)}
      fallback="/images/avatar-fallback.png"
    />} />
  } else {
    const fontSize = 28 * size / 64;
    avatarComponent = <StyledAvatar size={size} style={{ ...style, lineHeight: size - 4, backgroundColor }}>
      <Text style={{ fontSize, color: 'rgba(255,255,255,0.85)' }}>
        <UserOutlined />
      </Text>
    </StyledAvatar>
  }

  if (!editable) {
    return avatarComponent
  }

  const handleChange = (info) => {
    const { file, fileList } = info;
    setFileList(fileList);

    if (file.status === 'done') {
      const newFileId = _.get(file, 'response.id', file.uid);
      onChange(newFileId);
    }
  };

  return (
    <Upload
      multiple={false}
      action={`${process.env.REACT_APP_ZWF_API_ENDPOINT}/file?public=1`}
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
  color: PropTypes.string,
  value: PropTypes.string, // avatarFileId
  size: PropTypes.number,
  editable: PropTypes.bool,
  onChange: PropTypes.func,
  style: PropTypes.any,
};

UserAvatar.defaultProps = {
  color: '#00232944',
  size: 64,
  editable: false,
};


