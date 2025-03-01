import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Button } from 'antd';
import * as _ from 'lodash';
import { API_BASE_URL } from 'services/http';
import { getTaskDocDownloadUrl } from 'services/taskService';
import { UploadOutlined } from '@ant-design/icons';

export const TaskFileUpload = React.memo((props) => {
  const { taskId, onLoading, onDone } = props;


  const handleChange = (info) => {
    const { file } = info;

    if (file.status === 'done') {
      // props.onAdd?.(_.get(file, 'response.id', file.uid));
      const newFileId = file.response?.fileId
      if (newFileId) {
        file.uid = newFileId;
        file.url = getTaskDocDownloadUrl(newFileId)
      }
      onDone();
    }

    const uploading = file.status === 'uploading';
    onLoading(uploading);
  };

  return (<Upload
      multiple={true}
      action={`${API_BASE_URL}/task/${taskId}/file`}
      withCredentials={true}
      accept="*/*"
      listType="text"
      style={{ width: '100%' }}
      // onPreview={handlePreview}
      onChange={handleChange}
      // onRemove={handleRemove}
      // beforeUpload={handleBeforeUpload}
      showUploadList={false}
      // showUploadList={false}
      // iconRender={() => <UploadOutlined />}
      // iconRender={getFileIcon}
      // itemRender={renderFileItem}
    // showUploadList={true}
    >
      <Button block icon={<UploadOutlined />} type="text">Upload</Button>
    </Upload>
  );
})

TaskFileUpload.propTypes = {
  taskId: PropTypes.string.isRequired,
  onDone: PropTypes.func,
  onLoading: PropTypes.func,
};

TaskFileUpload.defaultProps = {
  onDone: () => { },
  onLoading: () => { },
};
