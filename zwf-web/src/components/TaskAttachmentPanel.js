import React from 'react';
import PropTypes from 'prop-types';
import { Space, List, Typography, Tooltip, Row, Col, Upload, Button } from 'antd';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import { getDocTemplate$ } from 'services/docTemplateService';
import { showDocTemplatePreviewModal } from './showDocTemplatePreviewModal';
import { VarTag } from './VarTag';
import { DeleteOutlined, ExclamationCircleFilled, ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { getPublicFileUrl } from 'services/fileService';
import { API_BASE_URL } from 'services/http';
import { TimeAgo } from './TimeAgo';
import { createOrphanTaskDoc$, listTaskDocs$ } from "services/taskDocService";
import { finalize } from 'rxjs/operators';
import { notify } from 'util/notify';
import { FileIcon } from './FileIcon';

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
  const { taskId, value: taskDocIds, allowTest, varBag, onChange, showWarning, renderVariable, mode, ...otherProps } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

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

  const handleDeleteDoc = id => {
    const newList = list.filter(x => x.id !== id);
    setList(newList);
    onChange(newList.map(x => x.id));
  }

  const handleClickTaskDoc = (e, taskDoc) => {
    e.stopPropagation();
  }

  const beforeUpload = (file) => {
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      notify.error('File must be smaller than 20MB!');
    }
    return isLt20M;
  }

  const listDataSource = React.useMemo(() => [...list, LAST_ADD_DOC_BUTTON_ITEM], [list]);

  return <Container>
    {/* <Upload
    action={`${API_BASE_URL}/file`}
    withCredentials={true}
    onChange={(info) => {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        debugger;
      } else if (info.file.status === 'error') {
        debugger;
      }
    }}
  >
    <Button>Upload</Button>
  </Upload> */}
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

      <List
        loading={loading}
        bordered={false}
        itemLayout="horizontal"
        dataSource={listDataSource}
        style={{padding: '0 12px'}}
        renderItem={item => item.isAddButton ? <List.Item>
          <List.Item.Meta
            avatar={<PlusOutlined />}
            title="Click or drag file to this area to upload"
            description="Support for a single or bulk upload. Maximumn size is 20MB per file."
          />
        </List.Item> : <List.Item
          onClick={e => handleClickTaskDoc(e, item)}
          actions={[
            item.isNewlyUploaded ? <Button danger type="text" icon={<DeleteOutlined />} onClick={() => handleDeleteDoc(item.id)} /> : null
          ]}
        >
          <List.Item.Meta
            avatar={<FileIcon name={item.name} width={36}/>}
            title={item.name}
            description={<>Created <TimeAgo value={item.createdAt} accurate={false} direction="horizontal" /></>}
          />
        </List.Item>}
      />
    </Upload.Dragger>
  </Container>

  const isDocTemplateMode = mode === 'taskTemplate'

  return taskDocIds?.length > 0 && <List
    size="small"
    bordered
    {...otherProps}
    rowKey="id"
    dataSource={taskDocIds}
    renderItem={doc => {
      const missingVarComps = (doc.variables ?? []).filter(v => varBag[v] === undefined || varBag[v] === '').map(v => <span key={v}>{renderVariable(v)}</span>);
      return <DocListItem onClick={isDocTemplateMode ? () => handlePreviewDocTemplate(doc.id) : null}>
        {isDocTemplateMode
          ? <Row justify="space-between" className="docItem">
            <Col><DocTemplateIcon /><Text>{doc.name}</Text></Col>
          </Row>
          : <TextLink href={getPublicFileUrl(doc.fileId)} target="_blank" style={{ width: '100%' }}>
            <Row justify="space-between" className="docItem">
              <Col><DocTemplateIcon /><Text>{doc.name}</Text></Col>
            </Row>
          </TextLink>}
        {showWarning && <Tooltip title={<>Fields {missingVarComps} are required to be input to generate the doc.</>}
          placement="topLeft"
          overlayStyle={{ maxWidth: 398 }}
          arrowPointAtCenter>
          <ExclamationCircleOutlined style={{
            color: '#cf1322',
            marginRight: 4,
            fontSize: 18,
            visibility: missingVarComps.length > 0 ? 'visible' : 'hidden',
            position: 'absolute',
            left: -30,
          }}
          />
        </Tooltip>}
        {/* {showWarning && missingVarComps.length > 0 && <Text style={{marginTop: 10, lineHeight: 0.8, fontSize: '0.8rem'}} type="danger">Fields {missingVarComps} are required for this doc.</Text>} */}
      </DocListItem>
    }}
  />
};

TaskAttachmentPanel.propTypes = {
  taskId: PropTypes.string,
  // value: PropTypes.arrayOf(PropTypes.shape({
  //   id: PropTypes.string,
  //   name: PropTypes.string,
  //   type: PropTypes.oneOf(['client', 'auto', 'agent']),
  //   docTemplateId: PropTypes.string,
  //   fileId: PropTypes.string,
  //   status: PropTypes.string,
  //   requiresSign: PropTypes.bool,
  //   officialOnly: PropTypes.bool,
  //   file: PropTypes.shape({
  //     location: PropTypes.string
  //   }),
  // })),
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

