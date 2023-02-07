import React from 'react';
import { Row, Col, Modal, Button, Card, Typography, Segmented } from 'antd';
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
import { createFieldItemSchema, TaskTemplateFieldControlDef } from 'util/TaskTemplateFieldControlDef';
import { FieldControlItem } from './FieldControlItem';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FieldListEditable } from './FieldListEditable';
import Field from '@ant-design/pro-field';
import { ProCard } from '@ant-design/pro-components';
import { Input } from 'antd';

const { Paragraph } = Typography;

const EMPTY_TASK_TEMPLATE = {
  name: 'Tax return',
  description: 'Please fill in the information as complete as possible.',
  fields: [
    {
      name: 'Unnamed field',
      description: '',
      type: 'text',
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

export const TaskTemplatePage = () => {
  const params = useParams();
  const { id: routeParamId } = params;
  const initTaskTemplateId = routeParamId;
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(!isNew);
  const [taskTemplateName, setTaskTemplateName] = React.useState('New Task Template');
  const [previewMode, setPreviewMode] = React.useState('agent');
  const [taskTemplate, setTaskTemplate] = React.useState(isNew ? EMPTY_TASK_TEMPLATE : null);
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

  const handleAddControl = (controlType) => {
    setTaskTemplate(pre => {
      const name = getUniqueNewFieldName(pre?.fields);
      const newField = createFieldItemSchema(controlType, name);
      return {
        ...pre,
        fields: [
          ...pre?.fields,
          newField,
        ]
      };
    });
  }

  const getUniqueNewFieldName = (allFields) => {
    const existingNames = new Set(allFields.map(f => f.name));
    let number = allFields?.length || 0;
    let name = `Field ${number}`;
    do {
      name = `Field ${number}`;
      number++;
    } while (existingNames.has(name));
    return name;
  }

  const handleFieldListChange = (fields) => {
    setTaskTemplate(pre => ({ ...pre, fields }));
  }

  const handleDescriptionChange = (e) => {
    setTaskTemplate(pre => ({ ...pre, description: e.target.value }));
  }

  return (
    // <PageContainer>

    <PageContainer
      // style={{ margin: 0, overflow: 'hidden' }}
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
      {/* {taskTemplate && <TaskTemplateEditorPanel
        ref={formRef}
        value={taskTemplate}
        onChange={setTaskTemplate}
        debug={debugMode}
      />} */}
      <DndProvider backend={HTML5Backend}>
        <ProCard ghost gutter={[40, 0]}>
          <ProCard colSpan={12} direction="column" ghost>
            <ProCard title="Edit description" ghost>
              <Input.TextArea placeholder='task description' maxLength={1000} showCount allowClear
                autoSize={{ minRows: 3 }}
                value={taskTemplate?.description}
                onChange={handleDescriptionChange}
              />
            </ProCard>
            <ProCard gutter={[20, 20]} title="Edit fields" ghost>
              <ProCard colSpan={"210px"} direction="column" layout="center" ghost>
                {TaskTemplateFieldControlDef.map((d, i) => <FieldControlItem
                  key={i}
                  icon={d.icon}
                  label={d.label}
                  type={d.type}
                  onDropDone={() => handleAddControl(d.type)}
                />)}
              </ProCard>
              <ProCard ghost style={{ height: '100%' }} layout="center">
                <FieldListEditable fields={taskTemplate?.fields} onChange={handleFieldListChange} />
              </ProCard>
            </ProCard>
          </ProCard>
          <ProCard colSpan={12} ghost direction="column">
            <ProCard
              title={<>Preview - {previewMode}</>}
              // type='inner'
              extra={<Segmented
                options={['agent', 'client']}
                onChange={setPreviewMode} />}
              layout="center"
              // bordered
              direction="column"
            // ghost
            >
              <TaskTemplatePreviewPanel
                value={taskTemplate}
                debug={debugMode}
                mode={previewMode}
              />
            </ProCard>
          </ProCard>
        </ProCard>

        {/* <Divider />
        <Field valueType="jsonCode" text={JSON.stringify(taskTemplate)} /> */}
      </DndProvider>
    </PageContainer>

  );
};

TaskTemplatePage.propTypes = {};

TaskTemplatePage.defaultProps = {};

export default TaskTemplatePage;
