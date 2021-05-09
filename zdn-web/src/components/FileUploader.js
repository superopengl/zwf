import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography, Space } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { getFile, searchFile } from 'services/fileService';
import { FileIcon } from './FileIcon';
import { saveAs } from 'file-saver';
import { AiOutlineUpload } from 'react-icons/ai';
import { Badge } from 'antd';
import { Popover } from 'antd';
import { TimeAgo } from './TimeAgo';

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
      const file = await getFile(id);
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
        <TimeAgo value={lastReadAt} prefix="Last read:" direction="horizontal" defaultContent="Unread"/>
        <TimeAgo value={signedAt} prefix="Signed at:" direction="horizontal" defaultContent="Unsigned"/>
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

export const FileUploader = (props) => {
  const { onUploadingChange, showsLastReadAt, showsSignedAt, showUploadList } = props;

  const [fileList, setFileList] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadFileList = async () => {
    const { value } = props;
    if (value && value.length) {
      setLoading(true);
      const list = await searchFile(value);
      const fileList = list.map(x => ({
        uid: x.id,
        name: x.fileName,
        status: 'done',
        url: x.location,
      }));
      setFileList(fileList);
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (onUploadingChange) {
      onUploadingChange(loading);
    }
  }, [loading]);

  React.useEffect(() => {
    loadFileList()
  }, []);

  const handleChange = (info) => {
    const { file, fileList } = info;
    setFileList(fileList);

    if(file.status === 'done') {
      props.onAdd( _.get(file, 'response.id', file.uid));
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
    props.onRemove(file.uid);
  }

  const { size, disabled } = props;

  const maxSize = size || 30;

  const getFileIcon = file => <FileIconWithOverlay
    id={file.uid}
    name={file.name}
    showsLastReadAt={showsLastReadAt}
    showsSignedAt={showsSignedAt}
  />

  return (
    <Container className="clearfix">
      <Dragger
        multiple={true}
        action={`${process.env.REACT_APP_ZDN_API_ENDPOINT}/file`}
        withCredentials={true}
        accept="*/*"
        listType="text"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        // beforeUpload={handleBeforeUpload}
        showUploadList={showUploadList}
        // showUploadList={false}
        // iconRender={() => <UploadOutlined />}
        disabled={disabled || fileList.length >= maxSize}
        iconRender={getFileIcon}
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
  );

}

FileUploader.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  size: PropTypes.number,
  disabled: PropTypes.bool,
  showsLastReadAt: PropTypes.bool,
  showsSignedAt: PropTypes.bool,
  showUploadList: PropTypes.any,
};

FileUploader.defaultProps = {
  disabled: false,
  showsLastReadAt: false,
  showsSignedAt: false,
  showUploadList: {
    showDownloadIcon: false,
    showRemoveIcon: true,
  },
};
