import { List, Button, Layout, Row, Col, Drawer, Typography, Modal, Card, Tooltip, Alert } from 'antd';
import React from 'react';
import { renameDocTemplate$ } from 'services/docTemplateService';
import styled from 'styled-components';
import { DocTemplatePreviewPanel } from 'components/DocTemplatePreviewPanel';
import { CopyOutlined, EyeOutlined, QuestionCircleOutlined, SaveFilled } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { saveDocTemplate$, getDocTemplate$ } from 'services/docTemplateService';
import { of } from 'rxjs';
import { delay, finalize, tap } from 'rxjs/operators';
import { DocTemplateIcon } from 'components/entityIcon';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { extractVarsFromDocTemplateBody } from 'util/extractVarsFromDocTemplateBody';
import { renameFieldInDocTemplateBody } from 'util/renameFieldInDocTemplateBody';
import DocTemplateRenameFieldInput from './DocTemplateRenameFieldInput';
import { RichTextInput } from 'components/RichTextInput';
import { useCloneDocTemplateModal } from './useCloneDocTemplateModal';
import ReactRouterPrompt from "react-router-prompt";
import { DOC_TEMPLATE_DEFAULT_HTML_BODY } from './DocTemplateDefaultBody';
import { normalizeVarsInDocTemplateHtml } from 'util/normalizeVarsInDocTemplateHtml';

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
  html: DOC_TEMPLATE_DEFAULT_HTML_BODY,
};


export const DocTemplatePage = (props) => {

  const params = useParams();
  const { id: routeParamId } = params;
  const initDocTemplateId = routeParamId;
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(true);
  const [showingHelp, setShowingHelp] = React.useState(false);
  const [docTemplate, setDocTemplate] = React.useState({ ...EMPTY_DOC_TEMPLATE });
  const [previewSider, setPreviewSider] = React.useState(false);
  const [docTemplateName, setDocTemplateName] = React.useState('New Doc Template');
  const [html, setHtml] = React.useState(docTemplate.html);
  const [dirty, setDirty] = React.useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [cloneAction, cloneContextHolder] = useCloneDocTemplateModal();

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

    saveDocTemplate$(entity).pipe(
      tap(() => setDirty(false)),
      tap(() => {
        notify.success(<>Successfully saved doc template <strong>{entity.name}</strong></>)
      }),
    ).subscribe(() => {
      // goBack();
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

  const handleChangeHtml = (html) => {
    setDirty(true);
    setHtml(normalizeVarsInDocTemplateHtml(html));
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

  const handleClone = () => {
    cloneAction({
      targetId: docTemplate.id,
      name: `Clone - ${docTemplate.name}`,
    })
  }

  return <Container>
    <ReactRouterPrompt when={dirty}>
      {({ isActive, onConfirm, onCancel }) => {
        if (isActive) {
          modal.confirm({
            key: 'leave-confirm',
            title: 'Leave without saving?',
            content: 'This page has unsaved changes. Leave without saving?',
            closable: false,
            maskClosable: false,
            destroyOnClose: true,
            onOk: onConfirm,
            onCancel: onCancel,
            okButtonProps: {
              danger: true
            },
            okText: 'Leave',
            cancelButtonProps: {
              type: 'text'
            },
            autoFocusButton: 'cancel'
          })
        }
      }}
    </ReactRouterPrompt>
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
        <Tooltip key="help" title="Help"><Button icon={<QuestionCircleOutlined />} onClick={() => setShowingHelp(true)} /></Tooltip>,
        <Tooltip key="clone" title="Clone"><Button icon={<CopyOutlined />} onClick={() => handleClone()} /></Tooltip>,
        <Button key="modal" type="primary" ghost icon={<EyeOutlined />} onClick={handlePopPreview}>Preview</Button>,
        <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
      ]}
    >
      {contextHolder}
      {showingHelp && <Alert
        type="info"
        style={{ marginBottom: 20 }}
        showIcon
        message="How to insert fields?"
        description={<Paragraph>
          The variables embraced by double curly braces <Text code>{'{{'}</Text> and <Text code>{'}}'}</Text> will be replaced by corresponding field values. For example, text <Text code>{'{{Client name}}'}</Text> will be replaced by the value of the field "Client name" on the form. The field replacement is <Text strong>case sensitive</Text>. So please make sure the field specified in this doc template content are aligned with the field names when design a <Link to="/task_template">form template</Link>.
        </Paragraph>}
        closable onClose={() => setShowingHelp(false)} />}
      {!loading && <Row gutter={20} wrap={false}>
        <Col flex={"740px"}>
          <RichTextInput value={html} onChange={handleChangeHtml} editorConfig={{ min_height: 842 }} />
        </Col>
        <Col flex="auto">
          <Card
            title="Defined Fields"
          >
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
          </Card>
        </Col>
      </Row>}
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
    {cloneContextHolder}
  </Container >
};

DocTemplatePage.propTypes = {};

DocTemplatePage.defaultProps = {};

export default DocTemplatePage;
