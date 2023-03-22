import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography, Space, List } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { getFileMeta, getFileMetaList } from 'services/fileService';
import { FileIcon } from './FileIcon';
import { saveAs } from 'file-saver';
import { AiOutlineUpload } from 'react-icons/ai';
import { Badge } from 'antd';
import { Popover } from 'antd';
import { TimeAgo } from './TimeAgo';
import { API_BASE_URL } from 'services/http';
import { Loading } from 'components/Loading';
import { TaskDocItem } from './TaskDocItem';
import { getTaskDocDownloadUrl } from 'services/taskService';
import { DebugJsonPanel } from './DebugJsonPanel';

const { Dragger } = Upload;
const { Text } = Typography;

const Container = styled.div`
border: 1px solid #D9D9D9;
border-radius: 4px;
width: 100%;
padding: 4px 12px;
background-color: white;

&.disabled {
  background-color: rgb(245, 245, 245);
}

& {
  .ant-upload-list-item {
    height: 60px;
  }
  .ant-upload-list-item-card-actions-btn {
    // background-color: yellow !important;
    width: 60px;
    height: 60px;
    position: relative;
    opacity: 0.5;
  }

  .ant-upload-list-item-info > span {
    display: flex;
    align-items: center;
  }

  .ant-upload-text-icon {
    display: inline-block;
  }
  .ant-upload-list-item-name {
    width: auto;
    padding-left: 8px;
  }

  .ant-upload.ant-upload-drag {
    border: none;
    background-color: transparent;
  }
}`;

const FileIconContainer = styled.div`
  display: inline-block;
  position: relative;
`;


const FileIconWithOverlay = props => {
  const { id, name, showsLastReadAt, showsSignedAt } = props

  const [file, setFile] = React.useState();

  const loadEntity = async () => {
    if (showsLastReadAt || showsSignedAt) {
      const file = await getFileMeta(id);
      setFile(file);
    }
  }

  React.useEffect(() => {
    loadEntity();
  }, []);

  if (!file) {
    return <FileIcon name={name} />
  }

  const { lastReadAt, signedAt } = file;

  return <Popover content={
    <Space direction="vertical">
      <TimeAgo value={lastReadAt} prefix="Last read:" direction="horizontal" defaultContent="Unread" />
      <TimeAgo value={signedAt} prefix="Signed at:" direction="horizontal" defaultContent="Unsigned" />
    </Space>
  } trigger="click">
    <FileIconContainer>
      <FileIcon name={name} />
      {!lastReadAt ? <Badge color="blue" style={{ position: 'absolute', top: -8, left: -8 }} /> :
        !signedAt ? <Badge color="red" style={{ position: 'absolute', top: -8, left: -8 }} /> :
          null}
    </FileIconContainer>
  </Popover>
}

export const TaskFileUpload = React.memo((props) => {
  const { task, docs, size, disabled, showsLastReadAt, showsSignedAt, onChange } = props;

  const taskId = task.id;

  const [fileList, setFileList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const maxSize = size || 30;

  React.useEffect(() => {
    setFileList(docs?.map(d => ({
      uid: d.id,
      name: d.name,
      status: 'done',
      url: getTaskDocDownloadUrl(d.fileId)
    })) ?? []);
  }, [docs]);

  const handleChange = (info) => {
    const { file, fileList } = info;
    setFileList(fileList);

    if (file.status === 'done') {
      // props.onAdd?.(_.get(file, 'response.id', file.uid));
      const newFileId = file.response?.fileId
      if (newFileId) {
        file.uid = newFileId;
        file.url = getTaskDocDownloadUrl(newFileId)
      }
      onChange(fileList.map(f => ({ fileId: f.uid, name: f.name })));
    }

    const uploading = file.status === 'uploading';
    setLoading(uploading);
  };

  const handleRemove = file => {
    onChange(docs.filter(f => f !== file));
  }

  const getFileIcon = file => <FileIconWithOverlay
    id={file.uid}
    name={file.name}
    showsLastReadAt={false}
    showsSignedAt={false}
  />

  const renderFileItem = (originNode, file, fileList) => {
    return originNode;
  }

  const handleSingleFileChange = file => {
    onChange([...docs]);
  }

  return (<>
    <Dragger
      multiple={true}
      action={`${API_BASE_URL}/task/${taskId}/file`}
      withCredentials={true}
      accept="*/*"
      listType="text"
      fileList={fileList}
      // onPreview={handlePreview}
      onChange={handleChange}
      // onRemove={handleRemove}
      // beforeUpload={handleBeforeUpload}
      showUploadList={false}
      // showUploadList={false}
      // iconRender={() => <UploadOutlined />}
      disabled={disabled || fileList.length >= maxSize}
      iconRender={getFileIcon}
      itemRender={renderFileItem}
    // showUploadList={true}
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
        <AiOutlineUpload size={30} style={{ fill: 'rgba(0, 0, 0, 0.65)' }} />
        Click or drag file to this area to upload
      </div>
    </Dragger>
    <DebugJsonPanel value={fileList} />
    </>
  );
})

TaskFileUpload.propTypes = {
  docs: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onAdd: PropTypes.func,
  size: PropTypes.number,
  disabled: PropTypes.bool,
};

TaskFileUpload.defaultProps = {
  disabled: false,
  onChange: () => { },
  onAdd: () => { },
};