import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography, Space, Button, Tooltip, List, Table, Modal } from 'antd';
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
import { deleteTaskDoc$, getTaskDocDownloadUrl, requestSignTaskDoc$, unrequestSignTaskDoc$, addDocTemplateToTask$, } from 'services/taskService';
import { DebugJsonPanel } from './DebugJsonPanel';
import { TaskFileName } from './TaskFileName';
import { FaSignature } from 'react-icons/fa';
import Icon, { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { useAddTaskDocModal } from 'hooks/useAddTaskDocModal';


const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

const Container = styled.div`

.ant-table-cell {
  border-bottom: none !important;
  padding: 8px 2px !important;
}
.ant-table-content {
  margin-left: -8px;
  margin-right: -8px;
}
`;

const FileIconContainer = styled.div`
  display: inline-block;
  position: relative;
`;


const FileIconWithOverlay = props => {
  const { id, name, size, showsLastReadAt, showsSignedAt } = props

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
    return <FileIcon name={name} width={size} />
  }

  const { lastReadAt, signedAt } = file;

  return <Popover content={
    <Space direction="vertical">
      <TimeAgo value={lastReadAt} prefix="Last read:" direction="horizontal" defaultContent="Unread" />
      <TimeAgo value={signedAt} prefix="Signed at:" direction="horizontal" defaultContent="Unsigned" />
    </Space>
  } trigger="click">
    <FileIconContainer>
      <FileIcon name={name} width={size} />
      {!lastReadAt ? <Badge color="blue" style={{ position: 'absolute', top: -8, left: -8 }} /> :
        !signedAt ? <Badge color="red" style={{ position: 'absolute', top: -8, left: -8 }} /> :
          null}
    </FileIconContainer>
  </Popover>
}

export const TaskDocListPanel = React.memo((props) => {
  const { task, size, disabled, showsLastReadAt, showsSignedAt, onChange } = props;

  const [fileList, setFileList] = React.useState(task.docs);
  const [loading, setLoading] = React.useState(!!task);
  const [deleteModal, deleteModalContextHolder] = Modal.useModal();
  const [docs, setDocs] = React.useState(task?.docs ?? []);
  const [openAddDoc, docContextHolder] = useAddTaskDocModal();

  const taskId = task.id;
  // const isPreviewMode = !taskId;
  const maxSize = size || 30;

  React.useEffect(() => {
    setDocs(task?.docs ?? []);
  }, [task]);


  React.useEffect(() => {
    setFileList(docs.map(doc => ({
      uid: doc.id,
      name: doc.name,
      status: 'done',
      url: doc.fileId ? getTaskDocDownloadUrl(doc.fileId) : null,
    })));
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
    // onChange(value.filter(f => f !== file));
  }

  const getFileIcon = file => <FileIconWithOverlay
    id={file.uid}
    name={file.name}
    showsLastReadAt={showsLastReadAt}
    showsSignedAt={showsSignedAt}
  />

  const renderFileItem = (originNode, file, fileList) => {
    return <div style={{ height: 40 }}>
      {/* {originNode} */}
      <TaskDocItem value={file} />
    </div>
  }

  const handleSingleFileChange = file => {
    // onChange([...value]);
  }


  const handleDeleteDoc = doc => {
    deleteModal.confirm({
      title: <>Delete doc {doc.name}?</>,
      maskClosable: true,
      closable: true,
      autoFocusButton: 'cancel',
      okButtonProps: {
        danger: true
      },
      cancelButtonProps: {
        type: 'text',
      },
      okText: 'Delete',
      onOk: () => {
        deleteTaskDoc$(doc.id).pipe(
        ).subscribe(() => {
          setDocs(docList => docList.filter(x => x.id !== doc.id));
        });
      }
    });
  }

  const handleRequestSign = doc => {
    const action$ = doc.signRequestedAt ? unrequestSignTaskDoc$ : requestSignTaskDoc$;
    action$(doc.id).subscribe(updatedDoc => {
      setDocs(docList => docList.map(x => x.id === updatedDoc.id ? updatedDoc : x));
    })
  }

  const columns = [
    {
      title: '',
      render: (_, doc) => <TaskFileName taskFile={doc} />,
    },
    {
      align: 'right',
      width: 32,
      render: (_, doc) => <Tooltip title={`Request sign for ${doc.name}`}>
        <Button shape="circle" type={doc.signRequestedAt ? 'primary' : 'default'} icon={<Icon component={FaSignature} />} onClick={() => handleRequestSign(doc)} />
      </Tooltip>
    },
    {
      align: 'right',
      width: 32,
      render: (_, doc) => <Tooltip title={`Delete ${doc.name}`}>
        <Button type="text" shape="circle" danger icon={<CloseOutlined />} onClick={() => handleDeleteDoc(doc)} />
      </Tooltip>
    },
  ];

  const handleAddDocTemplates = (docTemplateIds) => {
    setLoading(true);
    addDocTemplateToTask$(task.id, docTemplateIds)
      .pipe(
        finalize(() => setLoading(false)),
      )
      .subscribe(docs => setDocs(docList => [...docList, ...docs]));
  }


  return <Container>
    <ProCard
      title="Documents"
      extra={<Button icon={<PlusOutlined />}
        type="link"
        onClick={() => openAddDoc({ onChange: handleAddDocTemplates })}>Add</Button>}
    >
      <Table
        size="small"
        pagination={false}
        bordered={false}
        // rowSelection={{
        //   selectedRowKeys,
        //   onChange: handleSelectChange,
        // }}
        rowKey="id"
        showHeader={false}
        columns={columns}
        dataSource={docs}
      />
      {deleteModalContextHolder}
    </ProCard>
    {docContextHolder}
  </Container>

  // return <Container>
  //   <List
  //     grid={{ column: 1 }}
  //     dataSource={task.docs}
  //     renderItem={item => <List.Item>
  //       <TaskDocItem value={item} />
  //     </List.Item>}
  //   />
  // </Container>

  return (
    <Container className={disabled ? 'disabled' : ''}>
      {/* {!isPreviewMode && value?.map((f, i) => <TaskDocItem key={i}
          value={f}
          onDelete={handleRemove}
          onChange={handleSingleFileChange}
          disabled={disabled}
        />)} */}
      {!disabled && <Dragger
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
        showUploadList={true}
        // showUploadList={false}
        // iconRender={() => <UploadOutlined />}
        disabled={disabled || fileList.length >= maxSize}
        iconRender={getFileIcon}
        itemRender={renderFileItem}
      // showUploadList={true}
      >
        {/* <List
          grid={{ column: 1 }}
          dataSource={task.docs}
          renderItem={item => <List.Item>
            <TaskDocItem value={item} />
          </List.Item>}
        /> */}
        <Paragraph type="secondary" style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
          <AiOutlineUpload size={30} />
          Click or drag file to this area to upload
        </Paragraph>
      </Dragger>}
      {/* {!doc.length && <Text style={{ color: 'rgba(0, 0, 0, 0.25)' }}>File upload is disabled</Text>} */}
      {/* <DebugJsonPanel value={fileList} /> */}
    </Container>
  );
})

TaskDocListPanel.propTypes = {
  task: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onAdd: PropTypes.func,
  size: PropTypes.number,
  disabled: PropTypes.bool,
  showsLastReadAt: PropTypes.bool,
  showsSignedAt: PropTypes.bool,
};

TaskDocListPanel.defaultProps = {
  disabled: false,
  onChange: () => { },
  onAdd: () => { },
  showsLastReadAt: false,
  showsSignedAt: false,
};
