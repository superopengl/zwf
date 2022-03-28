import React from 'react';
import PropTypes from 'prop-types';
import { Image as AntdImage, Upload, Button, Space } from 'antd';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { API_BASE_URL } from 'services/http';
import { DeleteOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { finalize } from 'rxjs/operators';
import { notify } from 'util/notify';
import styled from 'styled-components';

const Container = styled.div`
.ant-upload, .ant-image-img {
  min-width: 104px;
  min-height: 104px;
}

.ant-upload.ant-upload-select-picture-card {
  width: auto;
  height: auto;
}
`;
function getBase64$(file, size) {
  const subject = new Subject();
  const reader = new FileReader();
  reader.onload = () => {
    const base64Url = reader.result;
    const image = new Image();
    image.onload = () => {
      const { width, height } = image;
      if (width >= size && height >= size) {
        subject.next(base64Url);
      } else {
        notify.error('Picture size is too small', `Please update a picture larger than ${size}px X ${size}px.`)
      }
    }
    image.src = base64Url;
  };
  reader.readAsDataURL(file);
  return subject;
}

export const ResourcePagePictureUpload = React.memo((props) => {
  const { size, value, onChange } = props;

  const [loading, setLoading] = React.useState(false);

  const handleChange = async (info) => {

  };

  const handleConvetToBase64 = (file) => {
    getBase64$(file, size)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(onChange)

    // Stop uploading to server
    return false;
  }

  const handleDelete = () => {
    onChange(null);
  }

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Container>
      <Upload
        multiple={false}
        listType="picture-card"
        accept="image/*"
        showUploadList={false}
        beforeUpload={handleConvetToBase64}
        onChange={handleChange}
        disabled={loading}
        width="100%"
      >
        {value ? <AntdImage src={value} alt="picture" preview={false} /> : uploadButton}
      </Upload>
      {value && <Button type="link" icon={<DeleteOutlined />} danger onClick={handleDelete} >delete</Button>}
    </Container>
  );
});

ResourcePagePictureUpload.propTypes = {
  value: PropTypes.string, // imageUrl or imageBase64
  size: PropTypes.number,
  onChange: PropTypes.func,
};

ResourcePagePictureUpload.defaultProps = {
  size: 120,
  onChange: (imageBase64) => { }
};


