import {
  DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined
} from '@ant-design/icons';
import { Button, Drawer, Layout, Modal, Space, PageHeader, Row, Typography, Input } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { deleteDocTemplate, listDocTemplate } from 'services/docTemplateService';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import DocTemplateEditorPanel from './DocTemplateEditorPanel';
import {DocTemplatePreviewPanel} from 'components/DocTemplatePreviewPanel';
import Icon, { SaveFilled } from '@ant-design/icons';
import { VscOpenPreview } from 'react-icons/vsc';
import { MdOpenInNew } from 'react-icons/md';
import { getTaskTemplate, saveTaskTemplate } from 'services/taskTemplateService';
import { v4 as uuidv4 } from 'uuid';
import ReactDOM from 'react-dom';
import { notify } from 'util/notify';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { saveDocTemplate, getDocTemplate$ } from 'services/docTemplateService';
import { of } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DocTemplateIcon } from 'components/entityIcon';
import { showDocTemplatePreviewModal } from 'components/showDocTemplatePreviewModal';

const { Text } = Typography;

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
  min-width: 350px;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;
`;

const EMPTY_DOC_TEMPLATE = {
  name: 'New doc template',
  description: '',
  html: ''
};


export const DocTemplatePage = (props) => {

  const routeParamId = props.match.params.id;
  const docTemplateId = routeParamId || uuidv4();
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(true);
  const [docTemplate, setDocTemplate] = React.useState({...EMPTY_DOC_TEMPLATE});
  const [previewSider, setPreviewSider] = React.useState(false);
  const debugMode = false;

  React.useEffect(() => {
    const obs$ = isNew ? of({ ...EMPTY_DOC_TEMPLATE }) : getDocTemplate$(docTemplateId);
    const subscription$ = obs$
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(d => setDocTemplate(d));
    return () => subscription$.unsubscribe();
  }, []);

  const goBack = () => {
    props.history.push('/doc_template')
  };

  const handleSave = async () => {
    const entity = {
      ...docTemplate,
      id: docTemplateId,
    };

    await saveDocTemplate(entity);
    notify.success(<>Successfully saved doc template <strong>{entity.name}</strong></>)
  }

  const handlePopPreview = () => {
    showDocTemplatePreviewModal(docTemplate);
  }

  return <LayoutStyled>
    <Loading loading={loading}>
      <Layout style={{ height: 'calc(100vh - 48px - 48px)', overflow: 'hidden' }}>
        <Layout.Content style={{ overflowY: 'auto' }}>
          <PageHeader
            style={{ maxWidth: 900, margin: '0 auto' }}
            title={<><DocTemplateIcon/>{isNew ? 'New Doc Template' : 'Edit Doc Template'}</>}
            onBack={goBack}
            extra={[
              <Button key="sider" type="primary" ghost={!previewSider} icon={<Icon component={() => <VscOpenPreview />} />} onClick={() => setPreviewSider(!previewSider)}>Side preview</Button>,
              <Button key="modal" type="primary" ghost icon={<Icon component={() => <MdOpenInNew />} />} onClick={handlePopPreview}>Preview</Button>,
              <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
            ]}
          >
            {!loading && <DocTemplateEditorPanel
              value={docTemplate}
              onChange={d => setDocTemplate(d)}
              debug={debugMode}
            />}
          </PageHeader>
        </Layout.Content>
        <Layout.Sider theme="light" width="50%" collapsed={!previewSider} collapsedWidth={0} style={{ overflowY: 'auto', marginLeft: 30, backgroundColor: 'transparent' }}>
            <DocTemplatePreviewPanel
              value={docTemplate}
              debug={debugMode}
              type="agent"
            />
        </Layout.Sider>
      </Layout>
    </Loading>
  </LayoutStyled >
};

DocTemplatePage.propTypes = {};

DocTemplatePage.defaultProps = {};

export default DocTemplatePage;
