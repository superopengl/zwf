import { Button, Layout, Row, Col, Typography } from 'antd';
import React from 'react';
import { renameDocTemplate$ } from 'services/docTemplateService';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { DocTemplateEditorPanel } from './DocTemplateEditorPanel';
import { DocTemplatePreviewPanel } from 'components/DocTemplatePreviewPanel';
import Icon, { LeftOutlined, SaveFilled } from '@ant-design/icons';
import { VscOpenPreview } from 'react-icons/vsc';
import { MdOpenInNew } from 'react-icons/md';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { saveDocTemplate$, getDocTemplate$ } from 'services/docTemplateService';
import { of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DocTemplateIcon } from 'components/entityIcon';
import { showDocTemplatePreviewModal } from 'components/showDocTemplatePreviewModal';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PageContainer } from '@ant-design/pro-components';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
const { Paragraph, Text } = Typography


const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
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
  name: 'New doc template',
  description: '',
  html: ''
};


export const DocTemplatePage = (props) => {

  const params = useParams();
  const { id: routeParamId } = params;
  const initDocTemplateId = routeParamId;
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(true);
  const [docTemplate, setDocTemplate] = React.useState({ ...EMPTY_DOC_TEMPLATE });
  const [previewSider, setPreviewSider] = React.useState(false);
  const [docTemplateName, setDocTemplateName] = React.useState('New Doc Template');
  const navigate = useNavigate();
  const debugMode = false;

  React.useEffect(() => {
    const obs$ = isNew ? of({ ...EMPTY_DOC_TEMPLATE, id: uuidv4() }) : getDocTemplate$(initDocTemplateId);
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
    navigate('/doc_template')
  };

  const handleSave = () => {
    const entity = {
      ...docTemplate,
      name: docTemplateName,
    };

    saveDocTemplate$(entity).subscribe(() => {
      notify.success(<>Successfully saved doc template <strong>{entity.name}</strong></>)
    });
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
      <Layout style={{ height: 'calc(100vh - 48px - 48px)', overflow: 'hidden' }}>
        <Layout.Content style={{ overflowY: 'auto' }}>
          <PageHeaderContainer
            style={{ maxWidth: 900, margin: '0 auto' }}
            breadcrumb={[
              {
                name: 'Templates'
              },
              {
                path: '/doc_template',
                name: 'Doc Template',
              },
              {
                name: docTemplateName
              }
            ]}
            icon={<DocTemplateIcon />}
            onBack={goBack}
            title={<ClickToEditInput placeholder={isNew ? 'New Doc Template' : "Edit doc template name"} value={docTemplateName} size={24} onChange={handleRename} maxLength={100} />}
            extra={[
              <Button key="sider" type="primary" ghost={!previewSider} icon={<Icon component={VscOpenPreview} />} onClick={() => setPreviewSider(!previewSider)}>Side preview</Button>,
              <Button key="modal" type="primary" ghost icon={<Icon component={MdOpenInNew} />} onClick={handlePopPreview}>Preview</Button>,
              <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
            ]}
          >
            <Paragraph type="secondary">
              The variables embraced by double curly braces <Text code>{'{{'}</Text> and <Text code>{'}}'}</Text> will be replaced by corresponding field values. For example, text <Text code>{'{{Client Name}}'}</Text> will be replaced by the value of the field with name "Client Name". The variable replacement is <Text strong>case sensitive</Text>. So please make sure the variables specified in this doc template content are aligned with the field names when <Link to="/task_template">design task templates</Link>.
            </Paragraph>
            {!loading && <DocTemplateEditorPanel
              value={docTemplate.html}
              onChange={html => docTemplate.html = html}
              debug={debugMode}
            />}
          </PageHeaderContainer>
        </Layout.Content>
        <Layout.Sider theme="light" width="50%" collapsed={!previewSider} collapsedWidth={0} style={{ overflowY: 'auto', marginLeft: 30, backgroundColor: 'transparent' }}>
          <DocTemplatePreviewPanel
            value={docTemplate}
            debug={debugMode}
            type="agent"
            allowTest={true}
          />
        </Layout.Sider>
      </Layout>
    </Loading>
  </LayoutStyled >
};

DocTemplatePage.propTypes = {};

DocTemplatePage.defaultProps = {};

export default DocTemplatePage;
