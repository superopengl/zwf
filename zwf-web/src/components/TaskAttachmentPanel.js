import React from 'react';
import PropTypes from 'prop-types';
import { List, Typography, Upload, Modal } from 'antd';
import { DocTemplateIcon } from 'components/entityIcon';
import styled from 'styled-components';
import { VarTag } from './VarTag';
import { API_BASE_URL } from 'services/http';
import { createOrphanTaskDocFromDocTemplate$, createOrphanTaskDocFromUploadedFile$, listTaskDocs$ } from "services/taskDocService";
import { finalize } from 'rxjs/operators';
import { notify } from 'util/notify';
import { Subscription } from 'rxjs';
import { AddNewTaskDocItem } from './AddNewTaskDocItem';
import { AddFromDocTemplateItem } from './AddFromDocTemplateItem';
import { TaskDocItem } from './TaskDocItem';
import DocTemplateSelect from './DocTemplateSelect';

const { Paragraph } = Typography;

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

const StyledList = styled(List)`
.ant-list-item-meta-title {
  margin-bottom: 0;

  .ant-typography {
    font-size: 14px;
  }
}

.ant-list-item:hover {
  background-color: rgb(250, 250, 250);
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
  const { value: taskDocIds, disabled, varBag, onChange, showWarning, mode } = props;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [docTemplateModalVisible, setDocTemplateModalVisible] = React.useState(false);

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

  const beforeUpload = (file) => {
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      notify.error('File must be smaller than 20MB!');
    }
    return isLt20M;
  }

  const listDataSource = React.useMemo(() => {
    return disabled ? list : [...list, ...EXTRA_ITEMS];
  }, [list]);

  const handleDeleteDoc = (item) => {
    const taskDocId = item.id;
    const newList = list.filter(x => x.id !== taskDocId);
    setList(newList)
    onChange(newList.map(x => x.id));
  }

  const handleTaskDocChange = () => {
    onChange(list.map(x => x.id))
  }

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
      style={{backgroundColor: 'transparent'}}
    >
      <StyledList
        dataSource={listDataSource}
        loading={loading}
        itemLayout="vertical"
        size="small"
        renderItem={item => item.isAddButton ? <AddNewTaskDocItem key="new-file" /> :
          item.isAddDocTemplateButton ? <AddFromDocTemplateItem key="new-doc-template" onClick={() => setDocTemplateModalVisible(true)} /> :
            <TaskDocItem
              // key={item.id}
              taskDoc={item}
              showCreatedAt={true}
              varBag={varBag}
              onChange={() => handleTaskDocChange(item)}
              onDelete={() => handleDeleteDoc(item)}
              onLoading={setLoading}
            // iconOverlay={item.type === 'auto' ? <Icon component={() => <MdBrightnessAuto/>} style={{color: '#37AFD2', fontSize: 20}} /> : null}
            />
        }
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

