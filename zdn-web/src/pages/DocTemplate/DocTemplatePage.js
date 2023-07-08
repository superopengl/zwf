import {
  DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined
} from '@ant-design/icons';
import { Button, Drawer, Layout, Modal, Space, PageHeader, Row, Typography } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import DocTemplateForm from './DocTemplateForm';
import React from 'react';
import { deleteDocTemplate, listDocTemplate } from 'services/docTemplateService';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import DocTemplateEditorPanel from './DocTemplateEditorPanel';
import DocTemplatePreviewPanel from './DocTemplatePreviewPanel';
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



export const DocTemplatePage = (props) => {

  const routeParamId = props.match.params.id;
  const docTemplateId = routeParamId || uuidv4();
  const isNew = !routeParamId;

  const [list, setList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentId, setCurrentId] = React.useState();
  const [docTemplate, setDocTemplate] = React.useState(null);
  const [preview, setPreview] = React.useState(false);
  const [previewSider, setPreviewSider] = React.useState(false);
  const debugMode = false;

  const handleEdit = (e, item) => {
    e.stopPropagation();
    setCurrentId(item.id);
    setDrawerVisible(true);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, name } = item;
    Modal.confirm({
      title: <>Delete Dot Template <strong>{name}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteDocTemplate(id);
        await loadList();
        setLoading(false);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const handleTestDocTemplate = (e) => {
    e.stopPropagation();

  }

  const loadList = async () => {
    setLoading(true);
    const list = await listDocTemplate();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    setLoading(true);
    let subscription$ = of();
    if (docTemplateId) {
      subscription$ = getDocTemplate$(docTemplateId)
        .pipe(
          finalize(() => setLoading(false))
        )
        .subscribe(d => setDocTemplate(d));
    }
    return () => subscription$.unsubscribe();
  }, [])

  const goBack = () => {
    props.history.push('/doc_template')
  };

  const handleCreateNew = () => {
    setCurrentId(undefined);
    setDrawerVisible(true);
  }

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  }

  const handleSave = async () => {
    const entity = {
      ...docTemplate,
      id: docTemplateId,
    };

    await saveDocTemplate(entity);
    notify.success(<>Successfully saved doc template <strong>{entity.name}</strong></>)
  }

  return <LayoutStyled>
    <Loading loading={loading}>
      <Layout style={{ height: 'calc(100vh - 48px - 48px)', overflow: 'hidden' }}>
        <Layout.Content style={{ overflowY: 'auto' }}>
          <PageHeader
            style={{ maxWidth: 900, margin: '0 auto' }}
            title={isNew ? 'New Doc Template' : 'Edit Doc Template'}
            onBack={goBack}
            extra={[
              <Button key="sider" type="primary" ghost={!previewSider} icon={<Icon component={() => <VscOpenPreview />} />} onClick={() => setPreviewSider(!previewSider)}>Side preview</Button>,
              <Button key="modal" type="primary" ghost icon={<Icon component={() => <MdOpenInNew />} />} onClick={() => setPreview(true)}>Preview</Button>,
              <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
            ]}
          >
            {docTemplate && <DocTemplateEditorPanel
              value={docTemplate}
              onChange={d => setDocTemplate(d)}
              debug={debugMode}
            />}
          </PageHeader>
        </Layout.Content>
        <Layout.Sider theme="light" width="50%" collapsed={!previewSider} collapsedWidth={0} style={{ overflowY: 'auto', marginLeft: 30 }}>
          <div style={{ padding: 16 }}>
            <Row justify="center" style={{ marginBottom: 40 }}>
              <Text type="warning">Preview</Text>
            </Row>
            <DocTemplatePreviewPanel
              value={docTemplate}
              debug={debugMode}
              type="agent"
            />
          </div>
        </Layout.Sider>
      </Layout>


      <Modal
        visible={preview}
        onOk={() => setPreview(false)}
        onCancel={() => setPreview(false)}
        closable={false}
        destroyOnClose
        maskClosable
        footer={null}
      >
        <DocTemplatePreviewPanel
          value={docTemplate}
          debug={debugMode}
          type="agent"
        />
      </Modal>
    </Loading>
  </LayoutStyled >

  return (<>
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <DocTemplateForm
        id={currentId}
        onClose={() => handleDrawerClose()}
        onOk={() => { handleDrawerClose(); loadList() }}
      />
    </Space>
  </>
  );
};

DocTemplatePage.propTypes = {};

DocTemplatePage.defaultProps = {};

export default DocTemplatePage;
