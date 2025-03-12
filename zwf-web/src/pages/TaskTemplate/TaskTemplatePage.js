import React from 'react';
import { Button, Drawer, Typography, Segmented } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { TaskFieldsPreviewPanel } from './TaskFieldsPreviewPanel';
import { EyeOutlined, SaveFilled } from '@ant-design/icons';
import { getTaskTemplate$, renameTaskTemplate$, saveTaskTemplate$ } from 'services/taskTemplateService';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { finalize } from 'rxjs/operators';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { TaskTemplateIcon } from 'components/entityIcon';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { of } from 'rxjs';
import { TaskTemplateFieldControlDefMap } from 'util/TaskTemplateFieldControlDef';
import { useAssertRole } from 'hooks/useAssertRole';
import TaskFieldEditorPanel from './TaskFieldEditorPanel';
import { TaskFieldsPreviewDrawer } from './TaskFieldsPreviewDrawer';

const Container = styled.div`
min-width: 800px;
max-width: 1200px;
width: 100%;
margin: 0 auto;
`;

const { Paragraph } = Typography;

const EMPTY_TASK_TEMPLATE = {
  name: 'New form template',
  fields: [
    {
      id: uuidv4(),
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
  useAssertRole(['admin', 'agent'])
  const params = useParams();
  const { id: routeParamId } = params;
  const initTaskTemplateId = routeParamId;
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(!isNew);
  const [openPreview, setOpenPreview] = React.useState(false);
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


  const handleSave = () => {
    if (!taskTemplate.fields?.length) {
      notify.error("Cannot Save", "This form template fields not defined.")
      return;
    }

    const entity = {
      ...taskTemplate,
      name: taskTemplateName,
    };

    saveTaskTemplate$(entity).subscribe(() => {
      notify.success(<>Successfully saved task template <strong>{entity.name}</strong></>)
      navigate('/task_template')
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
      onBack={() => navigate(-1)}
      loading={loading}
      ghost={true}
      icon={<TaskTemplateIcon />}
      title={<ClickToEditInput placeholder={isNew ? 'New Form Template' : "Form template name"} value={taskTemplateName} size={22} onChange={handleRename} maxLength={100} />}
      extra={[
        <Button key="preview" icon={<EyeOutlined />} onClick={() => setOpenPreview(true)}>Preview</Button>,
        <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
      ]}
    >
      {/* <DndProvider backend={HTML5Backend}>
        <ProCard gutter={[20, 20]} ghost className="field-control-column">
          <ProCard colSpan={"200px"} direction="column" layout="center" ghost >
            {TaskTemplateFieldControlDef.map(c => <FieldControlItem
              key={c.type}
              icon={c.icon}
              label={c.label}
              type={c.type}
              onDropStart={(newFieldId) => handleAddControl(c.type, newFieldId)}
              // onDropDone={() => handleAddControl(c.type)}
              index={taskTemplate?.fields.length}
            />)}
            <Col span={24}>
              <Paragraph type="secondary" style={{ textAlign: 'center', margin: '1rem auto' }}>
                Drag control to right panel to add new field.
              </Paragraph>
            </Col>
          </ProCard>
          <ProCard colSpan={"auto"} ghost style={{}} bodyStyle={{ padding: 0 }} layout="center">
            <FieldListEditable fields={taskTemplate?.fields} onChange={handleFieldListChange} />
          </ProCard>
          <ProCard colSpan={"300px"} ghost layout="center" direction='column'>
          </ProCard>
        </ProCard>
      </DndProvider> */}
      <TaskFieldEditorPanel fields={taskTemplate?.fields ?? []} onChange={handleFieldListChange} />
      <TaskFieldsPreviewDrawer
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        name={taskTemplate?.name}
        fields={taskTemplate?.fields}
      />
    </PageHeaderContainer>
  </Container>
  );
};

TaskTemplatePage.propTypes = {};

TaskTemplatePage.defaultProps = {};

export default TaskTemplatePage;
