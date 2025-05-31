import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Space, Button } from 'antd';
import { getPublicFileUrl } from 'services/fileService';
import { CloseOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { API_BASE_URL } from 'services/http';
import { notify } from 'util/notify';

export const OrgLogoUpload = React.memo((props) => {
  const { value, onChange } = props;

  const [imageFileId, setImageFileId] = React.useState(value);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    onChange(imageFileId)
  }, [imageFileId]);

  const handleChange = (info) => {
    const { file } = info;
    if (file.status === 'uploading') {
      setLoading(true);
      return;
    }

    if (file.status === 'done') {
      const fileId = file.response.id;
      setImageFileId(fileId);
    }
    setLoading(false);
  };

  const beforeUpload = (file) => {
    const isLt2M = file.size / 1024 / 1024 <= 5;
    if (!isLt2M) {
      notify.error('Image must be smaller than 5MB!');
    }
    return isLt2M;
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setImageFileId("");
  }

  return (
    <Upload
      // listType="picture-card"
      // className="avatar-uploader"
      beforeUpload={beforeUpload}

      multiple={false}
      action={`${API_BASE_URL}/file?public=1`}
      withCredentials={true}
      accept="image/*"
      showUploadList={false}
      // fileList={fileList}
      onChange={handleChange}
    >
      {imageFileId ? (<Space align='start'>
        <img
          src={getPublicFileUrl(imageFileId)}
          alt="logo"
          style={{
            maxWidth: '100%',
            maxHeight: 100,
            cursor: 'pointer',
          }}
        />
        <Button type="link" danger onClick={handleDelete} icon={<CloseOutlined/>}></Button>
        </Space>
      ) : (
        <Button loading={loading} icon={<UploadOutlined/>}>Upload Logo File</Button>
      )}
    </Upload>
  );
});

OrgLogoUpload.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

OrgLogoUpload.defaultProps = {
};


