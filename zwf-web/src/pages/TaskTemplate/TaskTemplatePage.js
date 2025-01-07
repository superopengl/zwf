import React from 'react';
import { Row, Col, Modal, Button, Card, Tag, Segmented } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import TaskTemplateEditorPanel from './TaskTemplateEditorPanel';
import TaskTemplatePreviewPanel from './TaskTemplatePreviewPanel';
import Icon, { LeftOutlined, SaveFilled } from '@ant-design/icons';
import { MdOpenInNew } from 'react-icons/md';
import { getTaskTemplate$, renameTaskTemplate$, saveTaskTemplate$ } from 'services/taskTemplateService';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { PageContainer } from '@ant-design/pro-components';
import { finalize } from 'rxjs/operators';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { TaskTemplateIcon } from 'components/entityIcon';
import { of } from 'rxjs';
import { Divider } from 'antd';
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';
import { FieldControlItem } from './FieldControlItem';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

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
  const { id: routeParamId } = params;
  const initTaskTemplateId = routeParamId;
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(!isNew);
  const [taskTemplateName, setTaskTemplateName] = React.useState('New Task Template');
  const [previewMode, setPreviewMode] = React.useState('agent');
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

  const handleSave = () => {
    // await formRef.current.validateFields();

    const entity = {
      ...taskTemplate,
      name: taskTemplateName,
    };

    saveTaskTemplate$(entity).subscribe(() => {
      notify.success(<>Successfully saved task template <strong>{entity.name}</strong></>)
    });
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
      <Divider />
      <Row>

      </Row>
      <DndProvider backend={HTML5Backend}>
      <Row gutter={[20, 20]} wrap={false}>
        <Col flex="240px">
          {TaskTemplateWidgetDef.map((d, i) => <FieldControlItem
            key={i}
            icon={d.icon}
            label={d.label}
            type={d.type}/>)}
        </Col>
        <Col flex="auto">

        </Col>
        <Col flex="auto">
          <Card
            title={<>Preview - {previewMode}</>}
            type='inner'
            extra={<Segmented options={[
              'agent',
              'client'
            ]}
              onChange={setPreviewMode} />}
          >

            <TaskTemplatePreviewPanel
              value={taskTemplate}
              debug={debugMode}
              type={previewMode}
            />
          </Card>
        </Col>
      </Row>
      </DndProvider>
    </PageContainer>

  );
};

TaskTemplatePage.propTypes = {};

TaskTemplatePage.defaultProps = {};

export default TaskTemplatePage;
