import React from 'react';
import PropTypes from 'prop-types';
import { Space, Button, Tooltip, Table, Modal, Dropdown, Typography, Row } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { TimeAgo } from './TimeAgo';
import { deleteTaskDoc$, requestSignTaskDoc$, unrequestSignTaskDoc$, addDemplateToTask$, } from 'services/taskService';
import { TaskDocName } from './TaskDocName';
import { FaSignature } from 'react-icons/fa';
import Icon, { CloseOutlined, MinusCircleOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { useAddDemplateToTaskModal } from 'hooks/useAddDemplateToTaskModal';
import { BsFileEarmarkTextFill } from 'react-icons/bs';
import { TaskFileUpload } from './TaskFileUpload';
import { TaskDocDropableContainer } from './TaskDocDropableContainer';

const { Text } = Typography;


const Container = styled.div`


`;

export const TaskDocListPanel = React.memo((props) => {
  const { task, onChange } = props;

  const [loading, setLoading] = React.useState(true);
  const [deleteModal, deleteModalContextHolder] = Modal.useModal();
  const [docs, setDocs] = React.useState(task?.docs ?? []);
  const [openAddDemplate, demplateContextHolder] = useAddDemplateToTaskModal();

  const taskId = task.id;
  // const isPreviewMode = !taskId;

  React.useEffect(() => {
    setDocs(task?.docs ?? []);
    setLoading(false);
  }, [task]);


  const handleDeleteDoc = (doc, e) => {
    e.stopPropagation();
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
      },
      // onCancel: e => e.stopPropagation(),
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
          <TaskDocName taskDoc={doc} showOverlay={false} />
          <TimeAgo prefix="Created" direction="horizontal" value={doc.createdAt} />
          <TimeAgo prefix="Sign requested" direction="horizontal" value={doc.signRequestedAt} />
        </Space>
        }>
        <div>
          <TaskDocName taskDoc={doc} />
        </div>
      </Tooltip>

    },
    {
      align: 'right',
      width: 32,
      render: (_, doc) => doc.signedAt ? null : <Tooltip title={doc.signRequestedAt ? `Revoke sign request` : `Request sign`}>
        <Button shape="circle" type={doc.signRequestedAt ? 'default' : 'primary'} icon={<Icon component={FaSignature} />} onClick={() => handleRequestSign(doc)} />
      </Tooltip>
    },
    {
      align: 'right',
      width: 32,
      render: (_, doc) => <Tooltip title={`Delete ${doc.name}`} placement="topRight">
        <Button shape="circle" icon={<MinusOutlined />} onClick={(e) => handleDeleteDoc(doc, e)} />
      </Tooltip>
    },
  ];

  const handleAddDemplates = (demplateIds) => {
    setLoading(true);
    addDemplateToTask$(task.id, demplateIds)
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
    key: 'demplate',
    label: <Button
      icon={<Icon component={BsFileEarmarkTextFill} />}
      type="text"
      block
      onClick={() => openAddDemplate({ onChange: handleAddDemplates })}
    >Add Doc Template</Button>
  }]

  return <Container>
    <Row justify="end" style={{ marginBottom: 20 }}>
      <Dropdown menu={{ items, onClick: ({ domEvent }) => domEvent.stopPropagation() }} overlayClassName="task-add-doc-menu" disabled={loading}>
        <Button icon={<PlusOutlined />}>Add Document</Button>
      </Dropdown>
    </Row>
    {/* <TaskDocDropableContainer taskId={taskId} onDone={onChange}> */}
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
      onClick={e => e.stopPropagation()}
      onRow={() => {
        return {
          onClick: e => e.stopPropagation()
        }
      }}
    />
    <div>
      {deleteModalContextHolder}
    </div>
    {demplateContextHolder}
    {/* </TaskDocDropableContainer> */}
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
