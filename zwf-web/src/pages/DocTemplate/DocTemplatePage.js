import { List, Button, Layout, Row, Col, Drawer, Typography, Modal } from 'antd';
import React from 'react';
import { renameDocTemplate$ } from 'services/docTemplateService';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import { DocTemplateEditorPanel } from './DocTemplateEditorPanel';
import { DocTemplatePreviewPanel } from 'components/DocTemplatePreviewPanel';
import Icon, { DeleteOutlined, EyeOutlined, QuestionCircleOutlined, QuestionOutlined, SaveFilled } from '@ant-design/icons';
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
import { ProCard } from '@ant-design/pro-components';
import { extractVarsFromDocTemplateBody } from 'util/extractVarsFromDocTemplateBody';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { renameFieldInDocTemplateBody } from 'util/renameFieldInDocTemplateBody';
import DocTemplateRenameFieldInput from './DocTemplateRenameFieldInput';
import { RichTextInput } from 'components/RichTextInput';
const { Paragraph, Text } = Typography


const Container = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  max-width: 1200px;
  // height: calc(100vh - 64px);
  height: 100%;

  .ant-page-header-heading-left {
    flex: 1;

    .ant-page-header-heading-title {
      flex: 1;
    }
  }
`;

const StyledList = styled(List)`
.ant-list-item {
  padding-left: 0;
  padding-right: 0;
}
`

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
  const [html, setHtml] = React.useState(docTemplate.html);
  const [modal, contextHolder] = Modal.useModal();

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
        setHtml(d.html);
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
    // showDocTemplatePreviewModal(docTemplate, { allowTest: true });
    setPreviewSider(true)
  }

  const handleRename = (newName) => {
    if (newName !== docTemplateName) {
      setDocTemplateName(newName);

      if (!isNew) {
        renameDocTemplate$(docTemplate.id, newName).subscribe();
      }
    }
  }

  const showHelp = () => {
    modal.info({
      title: 'How to insert fields?',
      closable: true,
      content: <Paragraph type="secondary">
        The variables embraced by double curly braces <Text code>{'{{'}</Text> and <Text code>{'}}'}</Text> will be replaced by corresponding field values. For example, text <Text code>{'{{Client Name}}'}</Text> will be replaced by the value of the field with name "Client Name". The variable replacement is <Text strong>case sensitive</Text>. So please make sure the variables specified in this doc template content are aligned with the field names when <Link to="/task_template">design task templates</Link>.
      </Paragraph>
    })
  }

  const fieldNames = React.useMemo(() => {
    docTemplate.html = html
    const { vars } = extractVarsFromDocTemplateBody(html);
    return vars;
  }, [html]);

  const handleRenameField = (oldName, newName) => {
    if (oldName.trim() !== newName.trim()) {
      const newHtml = renameFieldInDocTemplateBody(html, oldName, newName);
      setHtml(newHtml);
    }
  }

  const handleDeleteField = (fieldName) => {
    const newHtml = renameFieldInDocTemplateBody(html, fieldName, '');
    setHtml(newHtml);
  }

  return <Container>
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
      loading={loading}
      icon={<DocTemplateIcon />}
      onBack={goBack}
      title={<ClickToEditInput placeholder={isNew ? 'New Doc Template' : "Edit doc template name"} value={docTemplateName} size={24} onChange={handleRename} maxLength={100} />}
      extra={[
        <Button key="help" icon={<QuestionCircleOutlined />} onClick={() => showHelp()} />,
        <Button key="modal" type="primary" ghost icon={<EyeOutlined />} onClick={handlePopPreview}>Preview</Button>,
        <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
      ]}
    >
      {contextHolder}
      {!loading && <ProCard  ghost >
        <ProCard colSpan={"auto"} ghost layout="center" direction='column' style={{paddingRight: 20}}>
          <RichTextInput value={html} onChange={setHtml} />
        </ProCard>
        <ProCard colSpan={"300px"} title='Fields'>
          <Paragraph type="secondary">All fields in the doc template are list here</Paragraph>
          <StyledList
            dataSource={fieldNames}
            size="small"
            locale={{ emptyText: 'No fields created' }}
            renderItem={fieldName => <List.Item>
              <DocTemplateRenameFieldInput value={fieldName}
                onChange={newName => handleRenameField(fieldName, newName)}
                onDelete={() => handleDeleteField(fieldName)}
              />
            </List.Item>}
          />
        </ProCard>
      </ProCard>}
    </PageHeaderContainer>
    <Drawer
      title="Preview"
      closable
      maskClosable
      destroyOnClose
      open={previewSider}
      onClose={() => setPreviewSider(false)}
      width={700}
    >
      <DocTemplatePreviewPanel
        value={docTemplate}
        debug={debugMode}
        type="agent"
        allowTest={true}
      />
    </Drawer>
  </Container >
};

DocTemplatePage.propTypes = {};

DocTemplatePage.defaultProps = {};

export default DocTemplatePage;
