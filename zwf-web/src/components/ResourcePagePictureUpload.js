import React from 'react';
import PropTypes from 'prop-types';
import { Upload } from 'antd';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { API_BASE_URL } from 'services/http';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
function getBase64$(img) {
  const subject = new Subject();
  const reader = new FileReader();
  reader.addEventListener('load', () => subject.next(reader.result));
  reader.readAsDataURL(img);
  return subject;
}

export const ResourcePagePictureUpload = React.memo((props) => {
  const { size, value, onChange } = props;

  const [loading, setLoading] = React.useState(false);

  const handleChange = async (info) => {
    const { file } = info;

    if (file.status === 'done') {
      getBase64$(file.originFileObj).subscribe(onChange).add(() => setLoading(false));
    } else if (file.status === 'uploading') {
      setLoading(true);
    } else {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Upload
      multiple={false}
      listType="picture-card"
      action={`${API_BASE_URL}/file?public=1`}
      withCredentials={true}
      accept="image/*"
      showUploadList={false}
      onChange={handleChange}
      disabled={loading}
    >
     {value ? <img src={value} alt="picture" style={{ width: size }} /> : uploadButton}
    </Upload>
  );
});

ResourcePagePictureUpload.propTypes = {
  value: PropTypes.string, // imageUrl or imageBase64
  size: PropTypes.number,
  onChange: PropTypes.func,
};

ResourcePagePictureUpload.defaultProps = {
  size: 120,
  onChange: (imageBase64) => {}
};


