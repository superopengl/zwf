import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography, Space } from 'antd';
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
import { getTaskFieldDocs$ } from 'services/taskService';
import { Loading } from 'components/Loading';

const { Dragger } = Upload;
const { Text } = Typography;

const Container = styled.div`
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

export const TaskFileUploader = React.memo((props) => {
  const { value, fieldId, size, disabled, showsLastReadAt, showsSignedAt, showUploadList, onChange } = props;

  const [fileList, setFileList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const isPreviewMode = !fieldId;
  const maxSize = size || 30;

  React.useEffect(() => {
    if (!isPreviewMode && value?.length) {
      setLoading(true);
      getTaskFieldDocs$(fieldId, value).subscribe(docs => {
        setFileList(docs.map(doc => ({
          uid: doc.id,
          name: doc.name,
          status: 'done',
          url: `${API_BASE_URL}/task/field/${fieldId}/file/${doc.id}`
        })));
        setLoading(false);
      })
    } else {
      setFileList([]);
      setLoading(false);
    }
  }, [value]);

  const handleChange = (info) => {
    const { file, fileList } = info;
    setFileList(fileList);

    if (file.status === 'done') {
      // props.onAdd?.(_.get(file, 'response.id', file.uid));
      const newTaskDocId = file.response?.id
      if (newTaskDocId) {
        file.uid = newTaskDocId;
        file.url = `${API_BASE_URL}/task/field/${fieldId}/file/${newTaskDocId}`
      }
      onChange(fileList.map(f => f.uid));
    }

    const uploading = file.status === 'uploading';
    setLoading(uploading);
  };

  const handlePreview = file => {
    const fileName = file.name || file.response.fileName;
    const url = file.url || file.response.location;
    saveAs(url, fileName);
  }

  const handleRemove = file => {
    onChange(fileList.filter(f => f !== file).map(f => f.uid));
  }

  const getFileIcon = file => <FileIconWithOverlay
    id={file.uid}
    name={file.name}
    showsLastReadAt={showsLastReadAt}
    showsSignedAt={showsSignedAt}
  />

  const renderFileItem = (originNode, file, fileList) => {
    return originNode;
  }

  return (
    <Loading loading={loading}>
      <Container className="clearfix">
        <Dragger
          multiple={true}
          action={`${API_BASE_URL}/task/field/${fieldId}/file`}
          withCredentials={true}
          accept="*/*"
          listType="text"
          fileList={fileList}
          // onPreview={handlePreview}
          onChange={handleChange}
          onRemove={handleRemove}
          // beforeUpload={handleBeforeUpload}
          showUploadList={showUploadList}
          // showUploadList={false}
          // iconRender={() => <UploadOutlined />}
          disabled={isPreviewMode || disabled || fileList.length >= maxSize}
          iconRender={getFileIcon}
          itemRender={renderFileItem}
        // showUploadList={true}
        >
          {disabled ? <Text type="secondary">File upload is disabled</Text>
            : <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
              <AiOutlineUpload size={30} style={{ fill: 'rgba(0, 0, 0, 0.65)' }} />
              Click or drag file to this area to upload
            </div>}
        </Dragger>
        {/* {fileList.map((f, i) => <FileUploadItem key={i} value={f} />)} */}
      </Container>
    </Loading>
  );
})

TaskFileUploader.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  fieldId: PropTypes.string,
  onChange: PropTypes.func,
  onAdd: PropTypes.func,
  size: PropTypes.number,
  disabled: PropTypes.bool,
  showsLastReadAt: PropTypes.bool,
  showsSignedAt: PropTypes.bool,
  showUploadList: PropTypes.any,
};

TaskFileUploader.defaultProps = {
  disabled: false,
  onChange: () => { },
  onAdd: () => { },
  showsLastReadAt: false,
  showsSignedAt: false,
  showUploadList: {
    showDownloadIcon: false,
    showRemoveIcon: true,
  },
};
