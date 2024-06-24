import React from 'react';
import { Row, Col, Modal, Button, Card, Tag } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import TaskTemplateEditorPanel from './TaskTemplateEditorPanel';
import TaskTemplatePreviewPanel from './TaskTemplatePreviewPanel';
import Icon, { LeftOutlined, SaveFilled } from '@ant-design/icons';
import { MdOpenInNew } from 'react-icons/md';
import { getTaskTemplate$, renameTaskTemplate$, saveTaskTemplate } from 'services/taskTemplateService';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { PageContainer } from '@ant-design/pro-layout';
import { finalize } from 'rxjs/operators';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { TaskTemplateIcon } from 'components/entityIcon';
import { of } from 'rxjs';

const LayoutStyled = styled.div`
  margin: 0 auto;
  // background-color: #ffff00;
  // height: calc(100vh - 64px);
  // height: calc(100vh - 48px - 48px);
  overflow: hidden;
  max-width: 1000px;

  .ant-page-header-content {
    padding-top: 30px;
  }

  .ant-page-header-heading-left {
    flex: 1;

    .ant-page-header-heading-title {
      flex: 1;
    }
  }
`;

const StyledModal = styled(Modal)`
.ant-modal-content {
  background-color: transparent;
  box-shadow: none;
}
`;

const EMPTY_TASK_TEMPLATE = {
  name: 'Tax return',
  description: 'Please fill in the information as complete as possible.',
  fields: [
    {
      name: 'Unnamed field',
      description: '',
      type: 'input',
      required: true
    },
    // {
    //   name: 'Gender',
    //   type: 'radio',
    //   required: true,
    //   options: ['Male', 'Female', 'Other']
    // },
    // {
    //   name: 'Fiscal year',
    //   type: 'year',
    //   required: true,
    // },
    // {
    //   name: 'Comment',
    //   type: 'textarea',
    //   official: true,
    // }
  ]
};

export const TaskTemplatePage = props => {
  const params = useParams();
  const {id: routeParamId} = params;
  const initTaskTemplateId = routeParamId || uuidv4();
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(!isNew);
  const [preview, setPreview] = React.useState(false);
  const [taskTemplateName, setTaskTemplateName] = React.useState('New Task Template');
  const [taskTemplate, setTaskTemplate] = React.useState(isNew ? EMPTY_TASK_TEMPLATE : null);
  const formRef = React.useRef();
  const navigate = useNavigate();

  React.useEffect(() => {
    const obs$ = isNew ? of({ ...EMPTY_TASK_TEMPLATE, id: uuidv4() }) : getTaskTemplate$(initTaskTemplateId);
    const subscription$ = obs$
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(taskTemplate => {
        setTaskTemplate(taskTemplate)
        setTaskTemplateName(taskTemplate.name)
      });

    return () => {
      subscription$.unsubscribe();
    }
  }, []);

  React.useEffect(() => {
    if (taskTemplate) {
      setTaskTemplate(x => ({ ...x, name: taskTemplateName }));
    }
  }, [taskTemplateName])

  const goBack = () => {
    navigate('/task_template')
  }

  const handleSave = async () => {
    // await formRef.current.validateFields();

    const entity = {
      ...taskTemplate,
      name: taskTemplateName,
    };

    await saveTaskTemplate(entity);
    notify.success(<>Successfully saved task template <strong>{entity.name}</strong></>)
  }

  const debugMode = false;

  const handleRename = (newName) => {
    if (newName !== taskTemplateName) {
      setTaskTemplateName(newName);

      if (!isNew) {
        renameTaskTemplate$(taskTemplate.id, newName).subscribe();
      }
    }
  }

  return (
    // <PageContainer>

    <LayoutStyled>
      <PageContainer
        style={{ margin: 0, overflow: 'hidden' }}
        fixedHeader
        loading={loading}
        ghost={true}
        header={{
          backIcon: <LeftOutlined />,
          title: <Row align="middle" wrap={false} style={{ height: 46 }}>
            <Col><TaskTemplateIcon /></Col>
            <Col flex={1}>
              <ClickToEditInput placeholder={isNew ? 'New Task Template' : "Task template name"} value={taskTemplateName} size={24} onChange={handleRename} maxLength={100} />,
            </Col>
          </Row>,
          onBack: goBack,
          extra: [
            <Button key="modal" type="primary" ghost icon={<Icon component={MdOpenInNew } />} onClick={() => setPreview(true)}>Preview</Button>,
            <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
          ]
        }}
      >
        {taskTemplate && <TaskTemplateEditorPanel
          ref={formRef}
          value={taskTemplate}
          onChange={setTaskTemplate}
          debug={debugMode}
        />}
      </PageContainer>


      <StyledModal
        visible={preview}
        onOk={() => setPreview(false)}
        onCancel={() => setPreview(false)}
        closable={false}
        destroyOnClose
        maskClosable
        footer={null}
        width="100vw"
      >
        <Row gutter={40}>
          <Col span={12}>
            <Row justify="center" style={{ marginBottom: 12 }}><Tag color="processing">Agent view</Tag></Row>
            <Card>
              <TaskTemplatePreviewPanel
                value={taskTemplate}
                debug={debugMode}
                type="agent"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Row justify="center" style={{ marginBottom: 12 }}><Tag color="warning">Client view</Tag></Row>

            <Card>
              <TaskTemplatePreviewPanel
                value={taskTemplate}
                debug={debugMode}
                type="client"
              />
            </Card>
          </Col>
        </Row>

      </StyledModal>
    </LayoutStyled >
    // </PageContainer>

  );
};

TaskTemplatePage.propTypes = {};

TaskTemplatePage.defaultProps = {};

export default TaskTemplatePage;
