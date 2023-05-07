import React from 'react';
import { Button, Drawer, Typography, Segmented } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { TaskFieldsPreviewPanel } from './TaskFieldsPreviewPanel';
import { EyeOutlined, SaveFilled } from '@ant-design/icons';
import { getFemplate$, renameFemplate$, saveFemplate$ } from 'services/femplateService';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { finalize } from 'rxjs/operators';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { FemplateIcon } from 'components/entityIcon';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { of } from 'rxjs';
import { FemplateFieldControlDefMap } from 'util/FieldControlDef';
import { useAssertRole } from 'hooks/useAssertRole';
import TaskFieldEditorPanel from './TaskFieldEditorPanel';
import { TaskFieldsPreviewDrawer } from './TaskFieldsPreviewDrawer';
import { EditFieldsContext } from 'contexts/EditFieldsContext';

const Container = styled.div`
min-width: 800px;
max-width: 1200px;
width: 100%;
margin: 0 auto;
`;

const { Paragraph } = Typography;

const EMPTY_FEMPLATE = {
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

export const FemplatePage = () => {
  useAssertRole(['admin', 'agent'])
  const params = useParams();
  const { id: routeParamId } = params;
  const initFemplateId = routeParamId;
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(!isNew);
  const [openPreview, setOpenPreview] = React.useState(false);
  const [femplateName, setFemplateName] = React.useState('New Form Template');
  const [previewMode, setPreviewMode] = React.useState('agent');
  const [femplate, setFemplate] = React.useState(isNew ? EMPTY_FEMPLATE : null);
  const [fields, setFields] = React.useState([]);
  const [dragging, setDragging] = React.useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    const obs$ = isNew ? of({ ...EMPTY_FEMPLATE, id: uuidv4() }) : getFemplate$(initFemplateId);
    const subscription$ = obs$
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(femplate => {
        setFemplate(femplate)
        setFemplateName(femplate.name)
        setFields(femplate.fields ?? [])
      });

    return () => {
      subscription$.unsubscribe();
    }
  }, []);

  React.useEffect(() => {
    if (femplate) {
      setFemplate(x => ({ ...x, name: femplateName }));
    }
  }, [femplateName])

  React.useEffect(() => {
    setFemplate(pre => ({ ...pre, fields }));
  }, [fields])

  const handleSave = () => {
    if (!femplate.fields?.length) {
      notify.error("Cannot Save", "This form template fields not defined.")
      return;
    }

    const entity = {
      ...femplate,
      name: femplateName,
    };

    saveFemplate$(entity)
      .subscribe({
        next: () => {
          notify.success(<>Successfully saved form template <strong>{entity.name}</strong></>)
          navigate(-1)
        },
        error: () => { }
      });
  }


  const handleRename = (newName) => {
    if (newName !== femplateName) {
      setFemplateName(newName);

      if (!isNew) {
        renameFemplate$(femplate.id, newName).subscribe();
      }
    }
  }

  return (<Container>
    <PageHeaderContainer
      breadcrumb={[
        {
          name: 'Templates'
        },
        {
          path: '/femplate',
          name: 'Form Template',
          // menu: [
          //   'hi',
          //   'hi2'
          // ]
        },
        {
          name: femplateName
        }
      ]}
      onBack={() => navigate(-1)}
      loading={loading}
      ghost={true}
      icon={<FemplateIcon />}
      title={<ClickToEditInput placeholder={isNew ? 'New Form Template' : "Form template name"} value={femplateName} size={22} onChange={handleRename} maxLength={100} />}
      extra={[
        <Button key="preview" icon={<EyeOutlined />} onClick={() => setOpenPreview(true)}>Preview</Button>,
        <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
      ]}
    >
      <EditFieldsContext.Provider value={{
        fields,
        setFields,
        dragging,
        setDragging,
      }}>
        <TaskFieldEditorPanel />
      </EditFieldsContext.Provider>
      <TaskFieldsPreviewDrawer
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        name={femplate?.name}
        fields={femplate?.fields}
      />
    </PageHeaderContainer>
  </Container>
  );
};

FemplatePage.propTypes = {};

FemplatePage.defaultProps = {};

export default FemplatePage;
