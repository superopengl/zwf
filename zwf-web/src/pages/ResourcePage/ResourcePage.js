import { Button, Layout, PageHeader, Row, Col } from 'antd';

import React from 'react';
import { renameDocTemplate$ } from 'services/docTemplateService';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { ResourceEditorPanel } from './ResourceEditorPanel';
import { DocTemplatePreviewPanel } from 'components/DocTemplatePreviewPanel';
import Icon, { SaveFilled } from '@ant-design/icons';
import { VscOpenPreview } from 'react-icons/vsc';
import { MdOpenInNew } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { saveDocTemplate, getDocTemplate$ } from 'services/docTemplateService';
import { of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DocTemplateIcon, ResourcePageIcon } from 'components/entityIcon';
import { showDocTemplatePreviewModal } from 'components/showDocTemplatePreviewModal';
import { ClickToEditInput } from 'components/ClickToEditInput';


const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;

  .ant-page-header-heading-left {
    flex: 1;

    .ant-page-header-heading-title {
      flex: 1;
    }
  }

`;

const EMPTY_DOC_TEMPLATE = {
  name: 'Unnamed Page',
  description: '',
  html: ''
};


export const ResourcePage = (props) => {

  const routeParamId = props.match.params.id;
  const docTemplateId = routeParamId || uuidv4();
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(true);
  const [docTemplate, setDocTemplate] = React.useState({ ...EMPTY_DOC_TEMPLATE });
  const [previewSider, setPreviewSider] = React.useState(false);
  const [docTemplateName, setDocTemplateName] = React.useState('Unnamed Page');
  const debugMode = false;

  React.useEffect(() => {
    const obs$ = isNew ? of({ ...EMPTY_DOC_TEMPLATE }) : getDocTemplate$(docTemplateId);
    const subscription$ = obs$
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(d => {
        setDocTemplate(d);
        setDocTemplateName(d.name);
      });
    return () => subscription$.unsubscribe();
  }, []);

  const goBack = () => {
    props.history.push('/resources')
  };

  const handleSave = async () => {
    const entity = {
      ...docTemplate,
      id: docTemplateId,
      name: docTemplateName,
    };

    await saveDocTemplate(entity);
    notify.success(<>Successfully saved doc template <strong>{entity.name}</strong></>)
  }

  const handlePopPreview = () => {
    showDocTemplatePreviewModal(docTemplate, { allowTest: true });
  }

  const handleRename = (newName) => {
    if (newName !== docTemplateName) {
      setDocTemplateName(newName);

      if (!isNew) {
        renameDocTemplate$(docTemplate.id, newName).subscribe();
      }
    }
  }

  return <LayoutStyled>
    <Loading loading={loading}>
      <PageHeader
        ghost
        backIcon={false}
        style={{ maxWidth: 900, margin: '0 auto' }}
        title={<Row align="middle" wrap={false} style={{ height: 46 }}>
          <Col>
            <ResourcePageIcon />
          </Col>
          <Col flex={1}>
            <ClickToEditInput placeholder={isNew ? 'Unnamed Page' : "Edit Page"} value={docTemplateName} size={24} onChange={handleRename} maxLength={100} />
          </Col>
        </Row>}
      >
        {!loading && <ResourceEditorPanel
          value={docTemplate}
          onChange={d => setDocTemplate({ ...docTemplate, ...d })}
          debug={debugMode}
        />}
      </PageHeader>
    </Loading>
  </LayoutStyled >
};

ResourcePage.propTypes = {};

ResourcePage.defaultProps = {};

export default ResourcePage;
