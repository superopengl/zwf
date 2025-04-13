import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Table, Typography } from 'antd';
import * as _ from 'lodash';
import { API_BASE_URL } from 'services/http';
import { getTaskDocDownloadUrl } from 'services/taskService';
import { UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Loading } from './Loading';

const { Text } = Typography;

const Container = styled.div`
.ant-table {
  .ant-table-cell {
    border-bottom: none !important;
    padding: 8px 2px !important;
  }
}
`;

const CoverUploadDragger = styled(Upload.Dragger)`
.ant-upload {
  &.ant-upload-drag {
      border: none;
    }
  }

  .ant-upload-btn {
    padding: 0 !important;
  }
`;

const HoverCover = styled.div`
width: 100%;
height: 100%;
position: absolute;
top: 0;
bottom: 0;
left: 0;
right: 0;
background-color: rgba(255,255,255,0.75);
display: flex;
align-items: center;
justify-content: center;
border: 2px dashed #0FBFC4;
border-radius: 6px;
`;

export const TaskDocDropableContainer = React.memo((props) => {
  const { taskId, disabled, onDone, children } = props;

  const [canDrop, setCanDrop] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onMouseUp = () => {
    setCanDrop(false)
  };

  React.useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleChange = (info) => {
    const { file } = info;

    const uploading = file.status === 'uploading';
    setLoading(uploading);

    if (file.status === 'done') {
      // props.onAdd?.(_.get(file, 'response.id', file.uid));
      const newFileId = file.response?.fileId
      if (newFileId) {
        file.uid = newFileId;
        file.url = getTaskDocDownloadUrl(newFileId)
      }
      onDone();
    }
  };

  const handleMouseLeave = () => {
    setCanDrop(false);
  }

  const handlDragLeave = () => {
    setCanDrop(false);
  }

  const handleDrop = () => {
    setCanDrop(false);
  }

  const handleDragOver = e => {
    if (e.dataTransfer.types.includes('Files')) {
      setCanDrop(true);
    }
  }

  return (<Container className={canDrop ? 'dragging' : ''}
    onMouseLeave={handleMouseLeave}
    onDragOver={handleDragOver}
    onDragLeave={handlDragLeave}
    onDrop={handleDrop}
  >
    <Loading loading={loading}>
      <CoverUploadDragger
        class="upload"
        multiple={true}
        action={`${API_BASE_URL}/task/${taskId}/file`}
        withCredentials={true}
        accept="*/*"
        listType="text"
        style={{ width: '100%' }}
        disabled={disabled}
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
        <div style={{ opacity: loading || canDrop ? 0.4 : 1 }}>{children}</div>
        {canDrop && <HoverCover>
          <Text strong>Drag files here</Text>
        </HoverCover>}
      </CoverUploadDragger>
    </Loading>
  </Container>
  );
})

TaskDocDropableContainer.propTypes = {
  taskId: PropTypes.string.isRequired,
  onDone: PropTypes.func,
  disabled: PropTypes.bool,
};

TaskDocDropableContainer.defaultProps = {
  onDone: () => { },
  disabled: false
};
