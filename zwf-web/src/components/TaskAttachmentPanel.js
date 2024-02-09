import React from 'react';
import PropTypes from 'prop-types';
import { Space, List, Typography, Badge, Row, Tag, Upload, Button, Switch, Checkbox, Table } from 'antd';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import { getDocTemplate$ } from 'services/docTemplateService';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { VarTag } from './VarTag';
import Icon, { DeleteOutlined, ExclamationCircleFilled, ExclamationCircleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { getFileUrl, getPublicFileUrl, openFile } from 'services/fileService';
import { API_BASE_URL } from 'services/http';
import { TimeAgo } from './TimeAgo';
import { createOrphanTaskDoc$, getTaskDocDownloadUrl, listTaskDocs$, signTaskDoc$, toggleTaskDocsOfficialOnly$, toggleTaskDocsRequiresSign$ } from "services/taskDocService";
import { finalize } from 'rxjs/operators';
import { notify } from 'util/notify';
import { FileIcon } from './FileIcon';
import { GlobalContext } from 'contexts/GlobalContext';
import { FaFileSignature, FaSignature } from 'react-icons/fa';
import { ConfirmDeleteButton } from './ConfirmDeleteButton';
import { Subscription } from 'rxjs';

const { Text, Link: TextLink } = Typography;

const Container = styled.div`

.ant-upload-btn {
  margin: 0;
  padding: 0 !important;
}

.ant-upload.ant-upload-drag {
  text-align: left;
}

.ant-upload.ant-upload-drag .anticon-plus {
  font-size: 36px !important;
}

`;



const LAST_ADD_DOC_BUTTON_ITEM = {
  id: 'new',
  isAddButton: true
}

export const TaskAttachmentPanel = (props) => {
  const { value: taskDocIds, allowTest, varBag, onChange, showWarning, renderVariable, mode } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
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

    if(!force) {
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


  const handleChange = (info) => {
    const { file } = info;

    if (file.status === 'done') {
      const fileId = file.response.id;
      createOrphanTaskDoc$(fileId).subscribe(taskDoc => {
        taskDoc.isNewlyUploaded = true;
        setList(list => [...list, taskDoc]);
        onChange([...taskDocIds, taskDoc.id]);
      })
    }

    const uploading = file.status === 'uploading';
    setLoading(uploading);
  };

  const handleDeleteDoc = (id, e) => {
    e.stopPropagation();
    const newList = list.filter(x => x.id !== id);
    setList(newList);
    onChange(newList.map(x => x.id));
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
      case 'auto':
        return false;
      case 'client':
        return role === 'client' && user.id === taskDoc.createdBy
      case 'agent':
        return role === 'admin' || role === 'agent'
    }
    return false;
  }

  const canToggleOfficalOnly = (taskDoc) => {
    return !taskDoc.isAddButton && isAgent && taskDoc.type !== 'client'
  }

  const canRequestClientSign = (taskDoc) => {
    return !taskDoc.isAddButton && isAgent && taskDoc.type !== 'client' && taskDoc.fileId
  }

  const canClientSign = (taskDoc) => {
    return !taskDoc.isAddButton && isClient && taskDoc.requiresSign
  }

  const pendingClientRead = taskDoc => {
    return isClient && !taskDoc.lastClientReadAt;
  }

  const handlePreviewAutoDoc = (taskDoc, e) => {
    e.stopPropagation();
    const { docTemplateId } = taskDoc;
    getDocTemplate$(docTemplateId).subscribe(docTemplate => {
      showDocTemplatePreviewModal(docTemplate, {
        allowTest: false,
        type: role === 'client' ? 'client' : 'agent',
        varBag,
      });
    })
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
    setLoading(true);
    signTaskDoc$(taskDoc.id).subscribe(() => {
      reload$(true);
    })
  }

  const listDataSource = React.useMemo(() => {
    return [...list, LAST_ADD_DOC_BUTTON_ITEM];
  }, [list]);

  const columns = [
    {
      render: (value, item) => <Space align="start">
        <>{item.isAddButton ? <PlusOutlined style={{ fontSize: 36 }} /> : <FileIcon name={item.name} width={36} />}</>
        <div>
          <big>
            {item.isAddButton ? <Text type="secondary">Click or drag file to this area to upload</Text> :
              item.fileId ?
                <><TextLink href={getTaskDocDownloadUrl(item.id)} strong={pendingClientRead(item)} target="_blank">{item.name}</TextLink></> :
                <><TextLink onClick={(e) => handlePreviewAutoDoc(item, e)}>{item.name}</TextLink></>
            }
          </big>
          <div>
            {item.isAddButton ? <>
              <div><Text type="secondary">Support for single or bulk file upload. Maximumn 20MB per file.</Text></div>
            </> : <>Created <TimeAgo value={item.createdAt} accurate={false} direction="horizontal" /></>
            }
          </div>
          <div>{item.type === 'auto' &&
            <Text type="danger">Automatically generated doc, pending fields</Text>
          }
          </div>
        </div>
      </Space>
    },
    isClient ? null : {
      title: 'Hide from client?',
      width: 20,
      align: 'center',
      render: (value, item) => canToggleOfficalOnly(item) ? <Checkbox key="official" checked={item.officialOnly} onClick={(e) => handleToggleOfficialOnly(item, e)} /> : null
    },
    isClient ? null : {
      title: 'Require sign',
      width: 20,
      align: 'center',
      render: (value, item) => canRequestClientSign(item) ? <Checkbox key="official" checked={item.requiresSign} onClick={(e) => handleToggleRequireSign(item, e)} /> : null
    },
    {
      width: 20,
      align: 'center',
      render: (value, item) => <>
      {canDelete(item) && <ConfirmDeleteButton danger type="text" icon={<DeleteOutlined />} onOk={(e) => handleDeleteDoc(item.id, e)} />}
      {canClientSign(item) && <Button type="link" icon={<Icon component={() => <FaFileSignature />} />} onClick={(e) => handleSignTaskDoc(item.id, e)} >sign</Button>}
      </>
    }
  ].filter(x => x);


  return <Container>
    <Upload.Dragger
      multiple={true}
      action={`${API_BASE_URL}/file`}
      withCredentials={true}
      accept="*/*"
      listType="text"
      beforeUpload={beforeUpload}
      // fileList={fileList}
      itemRender={() => null}
      onChange={handleChange}
    >
      <Table
        dataSource={listDataSource}
        columns={columns}
        loading={loading}
        showHeader={isAgent}
        // size="small"
        pagination={false}
        rowKey={item => item.id}
        onRow={(item) => {
          return {
            onClick: e => item.isAddButton ? null : e.stopPropagation(),
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
  </Container>
};

TaskAttachmentPanel.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  allowTest: PropTypes.bool,
  showWarning: PropTypes.bool,
  varBag: PropTypes.object,
  renderVariable: PropTypes.func,
  mode: PropTypes.oneOf(['taskTemplate', 'task']),
  onChange: PropTypes.func,
};

TaskAttachmentPanel.defaultProps = {
  value: null,
  allowTest: false,
  showWarning: false,
  varBag: {},
  renderVariable: (varName) => <VarTag>{varName}</VarTag>,
  mode: 'taskTemplate',
  onChange: () => { }
};

