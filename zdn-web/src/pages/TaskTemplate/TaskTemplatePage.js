import React from 'react';
import { Row, Col, Typography, Modal, PageHeader, Button, Layout, Divider } from 'antd';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import TaskTemplateEditorPanel from './TaskTemplateEditorPanel';
import TaskTemplatePreviewPanel from './TaskTemplatePreviewPanel';
import Icon, { SaveFilled } from '@ant-design/icons';
import { VscOpenPreview } from 'react-icons/vsc';
import { MdOpenInNew } from 'react-icons/md';
import { getTaskTemplate$, saveTaskTemplate } from 'services/taskTemplateService';
import { v4 as uuidv4 } from 'uuid';
import ReactDOM from 'react-dom';
import { notify } from 'util/notify';
import ProLayout, { PageContainer } from '@ant-design/pro-layout';
import { of } from 'rxjs';
import { finalize } from 'rxjs/operators';

const { Title, Text } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto;
  // background-color: #ffff00;
  // height: calc(100vh - 64px);
  height: calc(100vh - 48px - 48px);
  overflow: hidden;
  // max-width: 900px;

  .ant-page-header-content {
    padding-top: 30px;
  }
`;

const EmptyTaskTamplateSchema = {
  name: 'Tax return',
  description: 'Please fill in the information as complete as possible.',
  fields: [
    {
      name: '',
      description: '',
      type: 'input',
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

export const TaskTemplatePage = props => {

  const routeParamId = props.match.params.id;
  const taskTemplateId = routeParamId || uuidv4();
  const isNew = !routeParamId;

  const [loading, setLoading] = React.useState(!isNew);
  const [preview, setPreview] = React.useState(false);
  const [previewSider, setPreviewSider] = React.useState(false);

  const [taskTemplate, setTaskTemplate] = React.useState(isNew ? EmptyTaskTamplateSchema : null);

  React.useEffect(() => {
    let subscription$ = of();
    if (!isNew) {
      // Load
      setLoading(true);
      subscription$ = getTaskTemplate$(taskTemplateId)
        .pipe(
          finalize(() => setLoading(false))
        )
        .subscribe(taskTemplate => {
          setTaskTemplate(taskTemplate)
          setLoading(false);
        });
    }
    return () => subscription$.unsubscribe();
  }, []);

  const goBack = () => {
    props.history.push('/task_template')
  }

  const handleSave = async () => {
    const entity = {
      ...taskTemplate,
      id: taskTemplateId,
    };

    await saveTaskTemplate(entity);
    notify.success(<>Successfully saved task template <strong>{entity.name}</strong></>)
  }

  const debugMode = false;

  return (
    // <PageContainer>

    <LayoutStyled>
      <Loading loading={loading}>
        <Layout style={{ height: 'calc(100vh - 48px - 48px)', overflow: 'hidden' }}>
          <Layout.Content style={{ overflowY: 'auto' }}>
            <PageHeader
              style={{ maxWidth: 900, margin: '0 auto' }}
              title={isNew ? 'New Task Template' : 'Edit Task Template'}
              onBack={goBack}
              extra={[
                <Button key="sider" type="primary" ghost={!previewSider} icon={<Icon component={() => <VscOpenPreview />} />} onClick={() => setPreviewSider(!previewSider)}>Side preview</Button>,
                <Button key="modal" type="primary" ghost icon={<Icon component={() => <MdOpenInNew />} />} onClick={() => setPreview(true)}>Preview</Button>,
                <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
              ]}
            >
              {taskTemplate && <TaskTemplateEditorPanel
                value={taskTemplate}
                onChange={schema => {
                  setTaskTemplate(schema);
                }}
                debug={debugMode}
              />}
            </PageHeader>
          </Layout.Content>
          <Layout.Sider theme="light" width="50%" collapsed={!previewSider} collapsedWidth={0} style={{ overflowY: 'auto', marginLeft: 30 }}>
            <div style={{ padding: 16 }}>
              <Row justify="center" style={{ marginBottom: 40 }}>
                <Text type="warning">Preview</Text>
              </Row>
              <TaskTemplatePreviewPanel
                value={taskTemplate}
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
          closable
          destroyOnClose
          maskClosable
          footer={null}
        >
          <TaskTemplatePreviewPanel
            value={taskTemplate}
            debug={debugMode}
            type="agent"
          />
        </Modal>
      </Loading>
    </LayoutStyled >
    // </PageContainer>

  );
};

TaskTemplatePage.propTypes = {};

TaskTemplatePage.defaultProps = {};

export default withRouter(TaskTemplatePage);
