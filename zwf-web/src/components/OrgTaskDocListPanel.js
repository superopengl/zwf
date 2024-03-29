import React from 'react';
import PropTypes from 'prop-types';
import { Space, Button, Tooltip, Table, Modal, Dropdown, Typography } from 'antd';
import * as _ from 'lodash';
import styled from 'styled-components';
import { TimeAgo } from './TimeAgo';
import { deleteTaskDoc$, requestSignTaskDoc$, unrequestSignTaskDoc$, addDemplateToTask$, generateDemplateDoc$, } from 'services/taskService';
import { TaskDocName } from './TaskDocName';
import Icon, { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { useAddDemplateToTaskModal } from 'hooks/useAddDemplateToTaskModal';
import { BsFileEarmarkTextFill } from 'react-icons/bs';
import { TaskFileUpload } from './TaskFileUpload';
import DropdownMenu from './DropdownMenu';
import { RiQuillPenLine, RiQuillPenFill } from 'react-icons/ri';
import { TaskDocDescription } from './TaskDocDescription';
import { TaskContext } from 'contexts/TaskContext';

const { Text } = Typography;


const Container = styled.div`
.ant-table-cell {
  border: none !important;
}

.ant-table-cell:first-child {
  padding-left: 0 !important;
}

.dropdown-menu {
  vertical-align: top;
}
`;

export const OrgTaskDocListPanel = React.memo((props) => {
  const { onChange } = props;

  const [loading, setLoading] = React.useState(true);
  const [deleteModal, deleteModalContextHolder] = Modal.useModal();
  const { task } = React.useContext(TaskContext);
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

  const handleGenerateDoc = doc => {
    generateDemplateDoc$(doc.id).subscribe({
      next: () => {
        onChange();
      }
    });
  }

  const columns = [
    {
      title: '',
      render: (_, doc) => <Tooltip
        color="white"
        placement='leftTop'
        overlayInnerStyle={{ color: '#4B5B76', padding: 20 }}
        title={<Space direction='vertical'>
          <TimeAgo prefix="Added" value={doc.createdAt} />
          <TimeAgo prefix="Generated" value={doc.generatedAt} />
          <TimeAgo prefix="Sign requested" value={doc.signRequestedAt} />
          <TimeAgo prefix="Signed" value={doc.signedAt} />
        </Space>
        }>
        <TaskDocName taskDoc={doc} />
        <TaskDocDescription taskDoc={doc} onGenDoc={() => handleGenerateDoc(doc)} />
      </Tooltip>
    },
    {
      align: 'right',
      fixed: 'right',
      width: 16,
      className: 'dropdown-menu',
      render: (text, doc) => {
        const hasFile = !!doc.fileId;

        return (
          <DropdownMenu
            config={[
              doc.signedAt || !hasFile ? null : {
                icon: <Icon component={doc.signRequestedAt ? RiQuillPenLine : RiQuillPenFill} />,
                menu: doc.signRequestedAt ? `Revoke sign request` : `Request sign`,
                onClick: () => handleRequestSign(doc)
              },
              doc.demplateId && !hasFile ? {
                icon: <Icon component={BsFileEarmarkTextFill} />,
                menu: `Generate doc`,
                onClick: () => handleGenerateDoc(doc)
              } : null,
              // {
              //   menu: 'Impersonate',
              //   onClick: () => handleImpersonante(item)
              // },
              {
                // icon: <MinusCircleOutlined/>,
                icon: <Text type="danger"><MinusCircleOutlined /></Text>,
                menu: <Text type="danger">Delete</Text>,
                // type: "danger",
                onClick: (e) => handleDeleteDoc(doc, e)
              },
            ]}
          />
        )
      },
    },
  ];

  const handleAddDemplates = (demplateIds) => {
    setLoading(true);
    addDemplateToTask$(task.id, demplateIds)
      .pipe(
        finalize(() => setLoading(false)),
      )
      .subscribe({
        next: onChange,
        error: () => { },
      });
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
    >Doc Template</Button>
  }]

  return <ProCard title={`Documents`}
    extra={<Dropdown menu={{ items, onClick: ({ domEvent }) => domEvent.stopPropagation() }} overlayClassName="task-add-doc-menu" disabled={loading}>
      <Button icon={<PlusOutlined />}>Add Document</Button>
    </Dropdown>}
    bodyStyle={{ paddingRight: 8 }}
  >
    <Container>
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
    </Container>
  </ProCard>
})

OrgTaskDocListPanel.propTypes = {
  onChange: PropTypes.func,
  onAdd: PropTypes.func,
  size: PropTypes.number,
  disabled: PropTypes.bool,
  showsLastReadAt: PropTypes.bool,
  showsSignedAt: PropTypes.bool,
};

OrgTaskDocListPanel.defaultProps = {
  disabled: false,
  onChange: () => { },
  onAdd: () => { },
  showsLastReadAt: false,
  showsSignedAt: false,
};
