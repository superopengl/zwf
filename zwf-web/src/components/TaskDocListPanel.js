import React from 'react';
import PropTypes from 'prop-types';
import { Upload, Typography, Space, Button, Tooltip, Table, Modal, Dropdown, Descriptions } from 'antd';
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
import Icon, { CloseOutlined, InfoCircleFilled, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { useAddDocTemplateToTaskModal } from 'hooks/useAddDocTemplateToTaskModal';
import { DocTemplateIcon } from './entityIcon';
import { BsFileEarmarkTextFill, BsInfoLg } from 'react-icons/bs';
import { TaskFileUpload } from './TaskFileUpload';


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
  const { task, size, showsLastReadAt, showsSignedAt, onChange } = props;

  const [fileList, setFileList] = React.useState(task.docs);
  const [loading, setLoading] = React.useState(true);
  const [deleteModal, deleteModalContextHolder] = Modal.useModal();
  const [docs, setDocs] = React.useState(task?.docs ?? []);
  const [openAddDocTemplate, docTemplateContextHolder] = useAddDocTemplateToTaskModal();

  const taskId = task.id;
  // const isPreviewMode = !taskId;

  React.useEffect(() => {
    setDocs(task?.docs ?? []);
    setLoading(false);
  }, [task]);


  React.useEffect(() => {
    setFileList(docs.map(doc => ({
      uid: doc.id,
      name: doc.name,
      status: 'done',
      url: doc.fileId ? getTaskDocDownloadUrl(doc.fileId) : null,
    })));
  }, [docs]);

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
      render: (_, doc) => <Tooltip
        color="white"
        placement='leftTop'
        overlayInnerStyle={{ color: '#4B5B76', padding: 20 }}
        title={<Space direction='vertical'>
          <TaskFileName taskFile={doc} />
          <TimeAgo prefix="Created" direction="horizontal" value={doc.createdAt} />
          <TimeAgo prefix="Sign requested" direction="horizontal" value={doc.signRequestedAt} />
        </Space>
        }>
          <div>

        <TaskFileName taskFile={doc} />
          </div>
      </Tooltip>

    },
    // {
    //   align: 'right',
    //   width: 32,
    //   render: (_, doc) => <Tooltip
    //     color="white"
    //     overlayInnerStyle={{ color: '#4B5B76', padding: 20 }}
    //     title={<Space direction='vertical'>
    //       <TaskFileName taskFile={doc} />
    //       <TimeAgo prefix="created" direction="horizontal" value={doc.createdAt} />
    //       <TimeAgo prefix="sign requested" direction="horizontal" value={doc.signRequestedAt} />
    //     </Space>
    //     }>
    //     <Button shape="circle" icon={<Icon component={BsInfoLg} />} type="text" />
    //   </Tooltip>
    // },
    {
      align: 'right',
      width: 32,
      render: (_, doc) => <Tooltip title={`Request sign`}>
        <Button shape="circle" type={doc.signRequestedAt ? 'primary' : 'default'} icon={<Icon component={FaSignature} />} onClick={() => handleRequestSign(doc)} />
      </Tooltip>
    },
    {
      align: 'right',
      width: 32,
      render: (_, doc) => <Tooltip title={`Delete ${doc.name}`} placement="topRight">
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

  const handleUploadDone = () => {
    setLoading(false);
    onChange();
  }

  const items = [{
    key: 'upload',
    label: <TaskFileUpload taskId={taskId} onLoading={setLoading} onDone={handleUploadDone} />
  }, {
    key: 'doc_template',
    label: <Button
      icon={<Icon component={BsFileEarmarkTextFill} />}
      type="text"
      block
      onClick={() => openAddDocTemplate({ onChange: handleAddDocTemplates })}
    >Add Doc Template</Button>
  }]

  return <Container>
    <ProCard
      title={<>{docs.length ?? 0} Document{docs.length === 1 ? '' : 's'}</>}
      type="inner"
      extra={<Dropdown menu={{ items }} overlayClassName="task-add-doc-menu" disabled={loading}>
        <Button icon={<PlusOutlined />}>Add</Button>
      </Dropdown>}
    >
      <Table
        size="small"
        loading={loading}
        pagination={false}
        bordered={false}
        rowKey="id"
        showHeader={false}
        columns={columns}
        dataSource={docs}
        locale={{ emptyText: 'Upload or add doc templates' }}
      // scroll={{
      //   y: 200
      // }}
      />
    </ProCard>
    {deleteModalContextHolder}
    {docTemplateContextHolder}
  </Container>
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
