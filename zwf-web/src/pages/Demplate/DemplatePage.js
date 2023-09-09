import { List, Button, Layout, Row, Col, Drawer, Typography, Modal, Card, Tooltip, Alert } from 'antd';
import React from 'react';
import { renameDemplate$ } from 'services/demplateService';
import styled from 'styled-components';
import { DemplatePreviewPanel } from 'components/DemplatePreviewPanel';
import { CopyOutlined, EyeOutlined, LeftOutlined, QuestionCircleOutlined, SaveFilled } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { saveDemplate$, getDemplate$ } from 'services/demplateService';
import { of } from 'rxjs';
import { delay, finalize, tap } from 'rxjs/operators';
import { DemplateIcon } from 'components/entityIcon';
import { ClickToEditInput } from 'components/ClickToEditInput';
import { useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { extractVarsFromDemplateBody } from 'util/extractVarsFromDemplateBody';
import { renameFieldInDemplateBody } from 'util/renameFieldInDemplateBody';
import DemplateRenameFieldInput from './DemplateRenameFieldInput';
import { RichTextInput } from 'components/RichTextInput';
import { useCloneDemplateModal } from './useCloneDemplateModal';
import ReactRouterPrompt from "react-router-prompt";
import { DOC_TEMPLATE_DEFAULT_HTML_BODY } from './DemplateDefaultBody';
import { normalizeVarsInDemplateHtml } from 'util/normalizeVarsInDemplateHtml';
import { useAssertRole } from 'hooks/useAssertRole';

const { Paragraph, Text } = Typography


const Container = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  // max-width: 1200px;
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


export const DemplatePage = () => {
  useAssertRole(['admin', 'agent'])
  const params = useParams();
  const { id: routeParamId } = params;
  const initDemplateId = routeParamId;
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [showingHelp, setShowingHelp] = React.useState(false);
  const [demplate, setDemplate] = React.useState({ ...EMPTY_DOC_TEMPLATE });
  const [previewSider, setPreviewSider] = React.useState(false);
  const [demplateName, setDemplateName] = React.useState('New Doc Template');
  const [html, setHtml] = React.useState(demplate.html);
  const [dirty, setDirty] = React.useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const [cloneAction, cloneContextHolder] = useCloneDemplateModal();
  const editorRef = React.useRef(null);
  const navigate = useNavigate();
  const debugMode = false;

  React.useEffect(() => {
    const obs$ = isNew ? of({ ...EMPTY_DOC_TEMPLATE, id: uuidv4() }) : getDemplate$(initDemplateId);
    const subscription$ = obs$
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(d => {
        setDemplate(d);
        setDemplateName(d.name);
        setHtml(d.html);
      });
    return () => subscription$.unsubscribe();
  }, []);

  const goBack = () => {
    navigate(-1)
  };

  const handleSave = () => {
    const entity = {
      ...demplate,
      name: demplateName,
    };

    setSaving(true)
    saveDemplate$(entity).pipe(
      tap(() => setDirty(false)),
      finalize(() => setSaving(false))
    )
      .subscribe({
        next: () => {
          notify.success(<>Successfully saved doc template <strong>{entity.name}</strong></>)
          navigate(-1)
        },
        error: () => { }
      });

  }

  const handlePopPreview = () => {
    // showDemplatePreviewModal(demplate, { allowTest: true });
    setPreviewSider(true)
  }

  const handleRename = (newName) => {
    if (newName !== demplateName) {
      setDemplateName(newName);

      if (!isNew) {
        renameDemplate$(demplate.id, newName).subscribe();
      }
    }
  }

  const handleChangeHtml = (html) => {
    setDirty(true);
    setHtml(normalizeVarsInDemplateHtml(html));
  }

  const fieldNames = React.useMemo(() => {
    demplate.html = html
    const { vars } = extractVarsFromDemplateBody(html);
    return vars;
  }, [html]);

  const handleRenameField = (oldName, newName) => {
    if (oldName.trim() !== newName.trim()) {
      const newHtml = renameFieldInDemplateBody(html, oldName, newName);
      setHtml(newHtml);
    }
  }

  const handleDeleteField = (fieldName) => {
    const newHtml = renameFieldInDemplateBody(html, fieldName, '');
    setHtml(newHtml);
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
      // style={{ maxWidth: 900, margin: '0 auto' }}
      breadcrumb={[
        {
          name: 'Templates'
        },
        {
          path: '/demplate',
          name: 'Doc Template',
        },
        {
          name: demplateName
        }
      ]}
      maxWidth={1200}
      loading={loading}
      icon={<DemplateIcon />}
      onBack={goBack}
      title={<ClickToEditInput placeholder={isNew ? 'New Doc Template' : "Edit doc template name"} value={demplateName} size={22} onChange={handleRename} maxLength={100} bordered={true} />}
      extra={[
        <Tooltip key="help" title="Help"><Button icon={<QuestionCircleOutlined />} onClick={() => setShowingHelp(true)} /></Tooltip>,
        <Button key="modal" type="primary" ghost icon={<EyeOutlined />} onClick={handlePopPreview}>Preview</Button>,
        <Button key="save" type="primary" icon={<SaveFilled />} loading={saving} onClick={() => handleSave()}>Save</Button>
      ]}
    >
      {contextHolder}
      {showingHelp && <Alert
        type="info"
        style={{ marginBottom: 20 }}
        showIcon
        message="How to insert fields?"
        description={<Paragraph>
          The variables embraced by double curly braces <Text code>{'{{'}</Text> and <Text code>{'}}'}</Text> will be replaced by corresponding field values. For example, text <Text code>{'{{Client name}}'}</Text> will be replaced by the value of the field "Client name" on the form. The field replacement is <Text strong>case sensitive</Text>. So please make sure the field specified in this doc template content are aligned with the field names when design a <Link to="/femplate">form template</Link>.
        </Paragraph>}
        closable onClose={() => setShowingHelp(false)} />}
      {!loading && <Row gutter={20} wrap={false}>
        <Col flex={"auto"}>
          <RichTextInput value={html} ref={editorRef} onChange={handleChangeHtml} editorConfig={{ min_height: 842 }} />
        </Col>
        <Col flex="320px">
          <Card
            title="Defined Fields"
          >
            <Paragraph type="secondary">All fields in the doc template are list here</Paragraph>
            <StyledList
              dataSource={fieldNames}
              size="small"
              locale={{ emptyText: 'No fields created' }}
              renderItem={fieldName => <List.Item>
                <DemplateRenameFieldInput value={fieldName}
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
      title={"Preview"}
      closable
      closeIcon={<LeftOutlined />}
      maskClosable
      destroyOnClose
      open={previewSider}
      onClose={() => setPreviewSider(false)}
      width={800}
      bodyStyle={{
        backgroundColor: '#888888',
        boxShadow: 'inset 0 0 16px #13161B',
      }}
    >
      <DemplatePreviewPanel
        value={demplate}
        debug={debugMode}
        type="agent"
        allowTest={true}
        editorElement={editorRef.current}
      />
    </Drawer>
    {cloneContextHolder}
  </Container >
};

DemplatePage.propTypes = {};

DemplatePage.defaultProps = {};

export default DemplatePage;
