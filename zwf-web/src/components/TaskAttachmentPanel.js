import React from 'react';
import PropTypes from 'prop-types';
import { Space, List, Typography, Badge, Row, Tag, Upload, Button, Switch, Checkbox, Table } from 'antd';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import { getDocTemplate$ } from 'services/docTemplateService';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { VarTag } from './VarTag';
import { DeleteOutlined, ExclamationCircleFilled, ExclamationCircleOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { getFileUrl, getPublicFileUrl, openFile } from 'services/fileService';
import { API_BASE_URL } from 'services/http';
import { TimeAgo } from './TimeAgo';
import { createOrphanTaskDoc$, listTaskDocs$ } from "services/taskDocService";
import { finalize } from 'rxjs/operators';
import { notify } from 'util/notify';
import { FileIcon } from './FileIcon';
import { GlobalContext } from 'contexts/GlobalContext';

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

const DocListItem = styled(List.Item)`
padding-left: 12px !important;
padding-right: 12px !important;
display: flex;
flex-direction: column;
position: relative;

.docItem {
  width: 100%;
}

&:hover {
  cursor: pointer;
  background-color: #F5F5F5;

  .docItem:after {
    content: "click to view";
    color: #37AFD2;
  }
}
`;

const convertToFileList = (docs) => {
  return (docs || []).map(d => ({
    id: d.id,
    uid: d.id,
    name: d.name,
    status: 'done',
    url: d.file?.location,
  }))
}

const LAST_ADD_DOC_BUTTON_ITEM = {
  isAddButton: true
}

export const TaskAttachmentPanel = (props) => {
  const { value: taskDocIds, allowTest, varBag, onChange, showWarning, renderVariable, mode, ...otherProps } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const context = React.useContext(GlobalContext);
  const { user, role } = context;

  React.useEffect(() => {
    if (!taskDocIds?.length) {
      setLoading(false)
      return;
    }
    const sub$ = listTaskDocs$(taskDocIds).pipe(
      finalize(() => setLoading(false))
    ).subscribe(setList);

    return () => sub$.unsubscribe();
  }, [taskDocIds]);

  const handlePreviewDocTemplate = docId => {
    getDocTemplate$(docId).subscribe(docTemplate => {
      showDocTemplatePreviewModal(docTemplate, { allowTest, varBag });
    })
  }

  const handleChange = (info) => {
    const { file, fileList, event } = info;

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

  const handleClickTaskDoc = (e, taskDoc) => {
    // Prevent from triggering the below Upload
    e.stopPropagation();
    // const { docTemplateId } = taskDoc;
    // if (docTemplateId) {
    //   alert('preview')
    // }
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
    return !taskDoc.isAddButton && role !== 'client' && taskDoc.type !== 'client'
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

  }

  const listDataSource = React.useMemo(() => {
    const filtered = role === 'client' ? list.filter(x => x.fileId) : list;
    return [...filtered, LAST_ADD_DOC_BUTTON_ITEM];
  }, [list]);

  const columns = [
    {
      render: (value, item) => <Space align="start">
        <>{item.isAddButton ? <PlusOutlined style={{ fontSize: 36 }} /> : <FileIcon name={item.name} width={36} />}</>
        <div>
          <big>
            {item.isAddButton ? <Text type="secondary">Click or drag file to this area to upload</Text> :
              item.fileId ?
                <TextLink href={getFileUrl(item.fileId)} target="_blank">{item.name}</TextLink> :
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
    role === 'client' ? null : {
      title: 'Hide from client?',
      width: 20,
      align: 'center',
      render: (value, item) => canToggleOfficalOnly(item) ? <Checkbox key="official" checked={item.officialOnly} onClick={(e) => handleToggleOfficialOnly(item, e)} /> : null
    },
    {
      width: 20,
      align: 'center',
      render: (value, item) => canDelete(item) ? <Button danger type="text" icon={<DeleteOutlined />} onClick={(e) => handleDeleteDoc(item.id, e)} /> : null
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
        // size="small"
        pagination={false}
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
  onChange: (taskDocIds) => { }
};

