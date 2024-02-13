import React from 'react';
import PropTypes from 'prop-types';
import { Space, List, Typography, Badge, Row, Tag, Upload, Button, Modal, Checkbox, Table, Tooltip } from 'antd';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import { getDocTemplate$ } from 'services/docTemplateService';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { VarTag } from './VarTag';
import Icon, { DeleteOutlined, ExclamationCircleFilled, ExclamationCircleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { getFileUrl, getPublicFileUrl, openFile } from 'services/fileService';
import { API_BASE_URL } from 'services/http';
import { TimeAgo } from './TimeAgo';
import { createOrphanTaskDocFromDocTemplate$, createOrphanTaskDocFromUploadedFile$, genDoc$, getTaskDocDownloadUrl, listTaskDocs$, signTaskDoc$, toggleTaskDocsOfficialOnly$, toggleTaskDocsRequiresSign$ } from "services/taskDocService";
import { finalize } from 'rxjs/operators';
import { notify } from 'util/notify';
import { FileIcon } from './FileIcon';
import { GlobalContext } from 'contexts/GlobalContext';
import { FaFileSignature, FaSignature } from 'react-icons/fa';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { Subscription } from 'rxjs';
import { AddNewTaskDocItem } from './AddNewTaskDocItem';
import { AddFromDocTemplateItem } from './AddFromDocTemplateItem';
import { TaskDocItem } from './TaskDocItem';
import { showSignTaskDocModal } from './showSignTaskDocModal';
import TaskTemplateSelect from './TaskTemplateSelect';
import DocTemplateSelect from './DocTemplateSelect';
import { BsFillPatchCheckFill, BsPatchCheck } from 'react-icons/bs';
import { Logo } from './Logo';
import { MdBrightnessAuto } from 'react-icons/md';

const { Text, Link: TextLink, Paragraph } = Typography;

const Container = styled.div`

.ant-upload-btn {
  margin: 0;
  padding: 0 !important;
}

.ant-upload.ant-upload-drag {
  text-align: left;
}

.ant-table-placeholder {
  .ant-table-cell {
    border: 0;
  }
}

.ant-table-row:last-child {
  .ant-table-cell {
    border: 0;
  }
}

`;



const LAST_ADD_DOC_BUTTON_ITEM = {
  id: 'newUploadFile',
  isAddButton: true,
  isExtra: true,
}

const LAST_DOC_TEMPLATEBUTTON_ITEM = {
  id: 'add-docTemplate',
  isAddDocTemplateButton: true,
  isExtra: true,
}

const EXTRA_ITEMS = [LAST_DOC_TEMPLATEBUTTON_ITEM, LAST_ADD_DOC_BUTTON_ITEM];

export const TaskAttachmentPanel = (props) => {
  const { value: taskDocIds, disabled, varBag, onChange, showWarning, renderVariable, mode } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [docTemplateModalVisible, setDocTemplateModalVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const { user, role } = context;

  const isClient = role === 'client';
  const isAgent = role === 'agent' || role === 'admin';

  React.useEffect(() => {
    const sub$ = reload$(true);
    return () => sub$.unsubscribe();
  }, [taskDocIds]);

  const reload$ = (force = false) => {
    setLoading(true);

    if (!force) {
      setList(list => [...list]);
      setLoading(false)
      return Subscription.EMPTY;
    }

    if (!taskDocIds?.length) {
      setLoading(false)
      return Subscription.EMPTY;
    }

    const sub$ = listTaskDocs$(taskDocIds).pipe(
      finalize(() => setLoading(false))
    ).subscribe(setList);

    return sub$;
  }


  const handleUploadFile = (info) => {
    const { file } = info;

    if (file.status === 'done') {
      const fileId = file.response.id;
      createOrphanTaskDocFromUploadedFile$(fileId).subscribe(taskDoc => {
        taskDoc.isNewlyUploaded = true;
        setList(list => [...list, taskDoc]);
        onChange([...taskDocIds, taskDoc.id]);
      })
    }

    const uploading = file.status === 'uploading';
    setLoading(uploading);
  };

  const handleDeleteDoc = (item, e) => {
    e.stopPropagation();
    const taskDocId = item.id;
    setList(list => {
      const newList = list.filter(x => x.id !== taskDocId);
      onChange(newList.map(x => x.id));
      return newList;
    })
  }

  const handleGenDoc = (item, e) => {
    e.stopPropagation();
    const taskDocId = item.id;
    setLoading(true);
    genDoc$(taskDocId).subscribe(() => {
      reload$(true)
    });
  }

  const beforeUpload = (file) => {
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      notify.error('File must be smaller than 20MB!');
    }
    return isLt20M;
  }

  const canDelete = (taskDoc) => {
    switch (taskDoc.type) {
      case 'client':
        return role === 'client' && user.id === taskDoc.createdBy && !taskDoc.signedAt
      case 'auto':
      case 'agent':
        return (role === 'admin' || role === 'agent') && !taskDoc.signedAt;
    }
    return false;
  }

  const canToggleOfficalOnly = (taskDoc) => {
    return !taskDoc.isExtra && isAgent && taskDoc.type !== 'client' && !taskDoc.signedAt
  }

  const canRequestClientSign = (taskDoc) => {
    return !taskDoc.isExtra && isAgent && taskDoc.type !== 'client' && taskDoc.fileId && !taskDoc.signedAt
  }

  const canClientSign = (taskDoc) => {
    return !taskDoc.isExtra && isClient && taskDoc.requiresSign && !taskDoc.signedAt
  }

  const canGenDoc = (taskDoc) => {
    return !taskDoc.isExtra && !isClient && taskDoc.docTemplateId && !taskDoc.fileId
  }

  const handleToggleOfficialOnly = (taskDoc, e) => {
    e.stopPropagation();
    const checked = e.target.checked;
    setLoading(true);
    toggleTaskDocsOfficialOnly$(taskDoc.id, checked).subscribe(() => {
      taskDoc.officialOnly = checked;
      reload$()
    })
  }

  const handleToggleRequireSign = (taskDoc, e) => {
    e.stopPropagation();
    const checked = e.target.checked;
    setLoading(true);
    toggleTaskDocsRequiresSign$(taskDoc.id, checked).subscribe(() => {
      taskDoc.requiresSign = checked;
      reload$(true)
    })
  }

  const handleSignTaskDoc = (taskDoc, e) => {
    e.stopPropagation();
    // setLoading(true);
    // signTaskDoc$(taskDoc.id).subscribe(() => {
    //   reload$(true);
    // })
    showSignTaskDocModal(taskDoc, {
      onOk: () => {
        reload$(true);
      }
    })
  }

  const listDataSource = React.useMemo(() => {
    return disabled ? list : [...list, ...EXTRA_ITEMS];
  }, [list]);

  const columns = React.useMemo(() => [
    {
      render: (value, item) => <big>
        {item.isAddButton ? <AddNewTaskDocItem /> :
          item.isAddDocTemplateButton ? <AddFromDocTemplateItem /> :
            <TaskDocItem 
            taskDoc={item} 
            showCreatedAt={true} 
            varBag={varBag}
            // iconOverlay={item.type === 'auto' ? <Icon component={() => <MdBrightnessAuto/>} style={{color: '#37AFD2', fontSize: 20}} /> : null}
            description={item.type === 'auto' ? <Text type="danger">Automatically generated doc, pending fields</Text> : null} 
            />}
      </big>
    },
    isClient ? null : {
      title: 'Require sign',
      // width: 20,
      align: 'center',
      render: (value, item) => item.signedAt ? <TimeAgo value={item.signedAt} prefix="Signed:" accurate={false} showTime={false} />
        : canRequestClientSign(item) ? <Checkbox key="official" checked={item.requiresSign} onClick={(e) => handleToggleRequireSign(item, e)} />
          : null
    },
    isClient ? null : {
      title: 'Hide from client?',
      width: 20,
      align: 'center',
      render: (value, item) => item.isExtra ? null : <Checkbox key="official" checked={item.officialOnly} onClick={(e) => handleToggleOfficialOnly(item, e)} disabled={!canToggleOfficalOnly(item)} />
    },
    {
      // width: 20,
      align: 'right',
      render: (value, item) => <>
        {canGenDoc(item) && <Tooltip title="generate doc"><Button type="link" icon={<Icon component={() => <BsPatchCheck />} />} onClick={(e) => handleGenDoc(item, e)} ></Button></Tooltip>}
        {canDelete(item) && <ConfirmDeleteButton danger type="text" icon={<DeleteOutlined />} onOk={(e) => handleDeleteDoc(item, e)} ></ConfirmDeleteButton>}
        {canClientSign(item) && <Button type="link" icon={<Icon component={() => <FaFileSignature />} />} onClick={(e) => handleSignTaskDoc(item, e)}>sign</Button>}
      </>
    }
  ].filter(x => x), []);

  const handleAddDocTemplate = (docTemplateId) => {
    createOrphanTaskDocFromDocTemplate$(docTemplateId).subscribe(taskDoc => {
      setDocTemplateModalVisible(false);
      setList(list => [...list, taskDoc]);
      onChange([...taskDocIds, taskDoc.id]);
    })
  }

  return <Container>
    {/* <em><small>{JSON.stringify(varBag, null, 2)}</small></em> */}
    <Upload.Dragger
      multiple={true}
      action={`${API_BASE_URL}/file`}
      withCredentials={true}
      accept="*/*"
      listType="text"
      beforeUpload={beforeUpload}
      // fileList={fileList}
      itemRender={() => null}
      onChange={handleUploadFile}
      disabled={disabled}
    >
      <Table
        dataSource={listDataSource}
        columns={columns}
        loading={loading}
        showHeader={isAgent}
        // size="small"
        locale={{
          emptyText: 'No file uploaded. You can upload files when the agent requires.'
        }}
        pagination={false}
        rowKey={item => item.id}
        onRow={(item) => {
          return {
            onClick: e => {
              if (!item.isAddButton) {
                e.stopPropagation();
              }
              if (item.isAddDocTemplateButton) {
                setDocTemplateModalVisible(true);
              }
              return null;
            },
            onDoubleClick: e => item.isAddButton ? null : e.stopPropagation(),
          }
        }}
        onHeaderRow={() => {
          return {
            onClick: e => e.stopPropagation(),
            onDoubleClick: e => e.stopPropagation(),
          }
        }}
      />
    </Upload.Dragger>
    <Modal
      title={<><DocTemplateIcon /> Add Doc Template</>}
      visible={docTemplateModalVisible}
      footer={null}
      onOk={() => setDocTemplateModalVisible(false)}
      onCancel={() => setDocTemplateModalVisible(false)}
      closable
      maskClosable
      destroyOnClose
    >
      <Paragraph>Select a doc template to add to the current task.</Paragraph>
      <DocTemplateSelect onChange={handleAddDocTemplate} style={{ width: '100%' }} isMultiple={false} />
    </Modal>
  </Container>
};

TaskAttachmentPanel.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  allowTest: PropTypes.bool,
  showWarning: PropTypes.bool,
  disabled: PropTypes.bool,
  varBag: PropTypes.object,
  renderVariable: PropTypes.func,
  mode: PropTypes.oneOf(['taskTemplate', 'task']),
  onChange: PropTypes.func,
};

TaskAttachmentPanel.defaultProps = {
  value: null,
  allowTest: false,
  showWarning: false,
  disabled: false,
  varBag: {},
  renderVariable: (varName) => <VarTag>{varName}</VarTag>,
  mode: 'taskTemplate',
  onChange: () => { }
};

