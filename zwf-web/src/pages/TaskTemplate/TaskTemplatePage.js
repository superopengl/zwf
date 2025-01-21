import React from 'react';
import { Row, Col, Modal, Button, Drawer, Typography, Segmented, Breadcrumb } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import TaskTemplateEditorPanel from './TaskTemplateEditorPanel';
import TaskTemplatePreviewPanel from './TaskTemplatePreviewPanel';
import Icon, { EyeOutlined, LeftOutlined, SaveFilled } from '@ant-design/icons';
import { MdOpenInNew } from 'react-icons/md';
import { getTaskTemplate$, renameTaskTemplate$, saveTaskTemplate$ } from 'services/taskTemplateService';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { PageContainer } from '@ant-design/pro-components';
import { finalize } from 'rxjs/operators';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { TaskTemplateIcon } from 'components/entityIcon';
import { PageHeaderContainer } from 'components/PagePathContainer';
import { of } from 'rxjs';
import { Divider } from 'antd';
import { createFieldItemSchema, TaskTemplateFieldControlDef, TaskTemplateFieldControlDefMap } from 'util/TaskTemplateFieldControlDef';
import { FieldControlItem } from './FieldControlItem';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { FieldListEditable } from './FieldListEditable';
import Field from '@ant-design/pro-field';
import { ProCard } from '@ant-design/pro-components';
import { Input } from 'antd';
import { FieldEditPanel } from './FieldEditPanel';
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom';

const Container = styled.div`
max-width: 1000px;
margin: 0 auto;

.ant-breadcrumb {
  padding: 1rem 40px 0;
}

.field-control-column {

  .ant-pro-card-col:first-child {
    padding-inline: 0 !important;
  }
}
`;

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
  const [openPreview, setOpenPreview] = React.useState(false);
  const [affixContainer, setAffixContainer] = React.useState(null);
  const [currentField, setCurrentField] = React.useState();
  const [taskTemplateName, setTaskTemplateName] = React.useState('New Form Template');
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
      const name = getUniqueNewFieldName(pre.fields, controlType);
      const newField = createFieldItemSchema(controlType, name);
      newField.id = pre.fields.length;
      return {
        ...pre,
        fields: [
          ...pre?.fields,
          newField,
        ]
      };
    });
  }

  const getUniqueNewFieldName = (allFields, newControlType) => {
    const existingNames = new Set(allFields.map(f => f.name));
    const controlDef = TaskTemplateFieldControlDefMap.get(newControlType);
    const fieldBaseName = controlDef.label;

    let number = allFields?.length || 0;
    let name = null;
    do {
      name = `${fieldBaseName} ${number}`;
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

  const handleChangeField = () => {

  }

  const handleDeleteField = () => {

  }

  return (<Container>
    <PageHeaderContainer
      breadcrumb={[
        {
          name: 'Templates'
        },
        {
          path: '/task_template',
          name: 'Form Template',
          // menu: [
          //   'hi',
          //   'hi2'
          // ]
        },
        {
          name: taskTemplateName
        }
      ]}
      loading={loading}
      ghost={true}
      icon={<TaskTemplateIcon />}
      title={<ClickToEditInput placeholder={isNew ? 'New Form Template' : "Form template name"} value={taskTemplateName} size={24} onChange={handleRename} maxLength={100} />}
      extra={[
        <Button key="preview" icon={<EyeOutlined />} onClick={() => setOpenPreview(true)}>Preview</Button>,
        <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
      ]}
    >
      <DndProvider backend={HTML5Backend}>
        <ProCard gutter={[20, 20]} ghost className="field-control-column">
          <ProCard colSpan={"200px"} direction="column" layout="center" ghost >
            {TaskTemplateFieldControlDef.map(c => <FieldControlItem
              key={c.type}
              icon={c.icon}
              label={c.label}
              type={c.type}
              onDropDone={() => handleAddControl(c.type)}
            />)}
            <Col span={24}>
              <Paragraph type="secondary" style={{ textAlign: 'center', margin: '1rem auto' }}>
                <small>Drag control to right panel to add new field.</small>
              </Paragraph>
            </Col>
          </ProCard>
          <ProCard colSpan={"auto"} ghost style={{}} bodyStyle={{ padding: 0 }} layout="center">
            <FieldListEditable fields={taskTemplate?.fields} onChange={handleFieldListChange} onSelect={setCurrentField} />
          </ProCard>
          <ProCard colSpan={"300px"} ghost layout="center" direction='column'>
            {/* <FieldEditPanel field={currentField} onChange={handleChangeField} onDelete={handleDeleteField} /> */}
          </ProCard>
        </ProCard>
      </DndProvider>
      <Drawer
        title="Preview"
        closable
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        maskClosable
        width="50%"
        extra={<Segmented
          options={['agent', 'client']}
          onChange={setPreviewMode} />}
      >
        <TaskTemplatePreviewPanel
          value={taskTemplate}
          debug={debugMode}
          mode={previewMode}
        />
      </Drawer>
    </PageHeaderContainer>
  </Container>
  );
};

TaskTemplatePage.propTypes = {};

TaskTemplatePage.defaultProps = {};

export default TaskTemplatePage;
