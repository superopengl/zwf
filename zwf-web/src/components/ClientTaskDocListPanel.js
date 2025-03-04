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



export const ClientTaskDocListPanel = React.memo((props) => {
  const { task, onChange } = props;

  const [fileList, setFileList] = React.useState(task.docs);
  const [loading, setLoading] = React.useState(true);
  const [docs, setDocs] = React.useState(task?.docs ?? []);

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
    {
      align: 'right',
      width: 32,
      render: (_, doc) => doc.signRequestedAt ? <Tooltip title={`Sign document`}>
        <Button type={doc.signRequestedAt ? 'primary' : 'default'} icon={<Icon component={FaSignature} />} onClick={() => handleRequestSign(doc)} >Sign</Button>
      </Tooltip> : null
    },
  ];


  const handleUploadDone = () => {
    setLoading(false);
    onChange();
  }

  return <Container>
    <ProCard
      title={<>{docs.length ?? 0} Document{docs.length === 1 ? '' : 's'}</>}
      type="inner"
      extra={<TaskFileUpload taskId={taskId} onLoading={setLoading} onDone={handleUploadDone} />}
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
  </Container>
})

ClientTaskDocListPanel.propTypes = {
  task: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onAdd: PropTypes.func,
  size: PropTypes.number,
  disabled: PropTypes.bool,
  showsLastReadAt: PropTypes.bool,
  showsSignedAt: PropTypes.bool,
};

ClientTaskDocListPanel.defaultProps = {
  disabled: false,
  onChange: () => { },
  onAdd: () => { },
  showsLastReadAt: false,
  showsSignedAt: false,
};
