import React from 'react';
import { Row, Col, Typography, Modal, Button } from 'antd';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import TaskTemplateEditorPanel from './TaskTemplateEditorPanel';
import TaskTemplatePreviewPanel from './TaskTemplatePreviewPanel';
import Icon, { SaveFilled } from '@ant-design/icons';
import { VscOpenPreview } from 'react-icons/vsc';
import { MdOpenInNew } from 'react-icons/md';
import { getTaskTemplate$, renameTaskTemplate$, saveTaskTemplate } from 'services/taskTemplateService';
import { v4 as uuidv4 } from 'uuid';
import { notify } from 'util/notify';
import { PageContainer } from '@ant-design/pro-layout';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Resizable } from "re-resizable";
import { ClickToEditInput } from 'components/ClickToEditInput';
import { TaskTemplateIcon } from 'components/entityIcon';

const { Title, Text } = Typography;

const LayoutStyled = styled.div`
  // margin: 0 auto;
  // background-color: #ffff00;
  // height: calc(100vh - 64px);
  // height: calc(100vh - 48px - 48px);
  overflow: hidden;
  // max-width: 900px;

  .ant-page-header-content {
    padding-top: 30px;
  }

  .ant-page-header-heading-left {
    flex: 1;

    .ant-page-header-heading-title {
      flex: 1;
    }
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
  const [previewWidth, setPreviewWidth] = React.useState(300);
  const [taskTemplateName, setTaskTemplateName] = React.useState('New Task Template');

  const [taskTemplate, setTaskTemplate] = React.useState(isNew ? EmptyTaskTamplateSchema : null);

  React.useEffect(() => {
    let subscription$ = Subscription.EMPTY;
    if (!isNew) {
      // Load
      setLoading(true);
      subscription$ = getTaskTemplate$(taskTemplateId)
        .pipe(
          finalize(() => setLoading(false))
        )
        .subscribe(taskTemplate => {
          setTaskTemplate(taskTemplate)
          setTaskTemplateName(taskTemplate.name)
          setLoading(false);
        });
    }
    return () => {
      subscription$.unsubscribe();
    }
  }, []);

  const goBack = () => {
    props.history.push('/task_template')
  }

  const handleSave = async () => {
    const entity = {
      ...taskTemplate,
      id: taskTemplateId,
      name: taskTemplateName,
    };

    await saveTaskTemplate(entity);
    notify.success(<>Successfully saved task template <strong>{entity.name}</strong></>)
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

  return (
    // <PageContainer>

    <LayoutStyled>
      <PageContainer
        style={{ margin: 0, overflow: 'hidden' }}
        fixedHeader
        loading={loading}
        ghost={true}
        header={{
          backIcon: false,
          title: <Row align="middle" wrap={false} style={{height: 46}}>
            <Col><TaskTemplateIcon /></Col>
            <Col flex={1}>
              <ClickToEditInput placeholder={isNew ? 'New Task Template' : "Task template name"} value={taskTemplateName} size={24} onChange={handleRename} maxLength={100} />,
            </Col>
          </Row>,
          onBack: goBack,
          extra: [
            <Button key="sider" type="primary" ghost={!previewSider} icon={<Icon component={() => <VscOpenPreview />} />} onClick={() => setPreviewSider(!previewSider)}>Side preview</Button>,
            <Button key="modal" type="primary" ghost icon={<Icon component={() => <MdOpenInNew />} />} onClick={() => setPreview(true)}>Preview</Button>,
            <Button key="save" type="primary" icon={<SaveFilled />} onClick={() => handleSave()}>Save</Button>
          ]
        }}
      >
        <div style={{ height: 'calc(100vh - 48px - 72px - 30px)', overflow: 'hidden', display: 'flex', flexDirection: 'row' }}>
          <div style={{ overflowY: 'auto', flexGrow: 1 }}>
            {taskTemplate && <TaskTemplateEditorPanel
              value={taskTemplate}
              onChange={schema => {
                setTaskTemplate(schema);
              }}
              debug={debugMode}
            />}
          </div>
          {previewSider && <Resizable
            style={{ marginLeft: 30 }}
            size={{ width: previewWidth, height: '100%' }}
            minWidth={300}
            maxWidth={800}
            enable={{ top: false, right: false, bottom: false, left: true }}
            handleClasses={{ left: 'resize-handler' }}
            onResizeStop={(e, direction, ref, d) => {
              setPreviewWidth(w => Math.max(w + d.width, 300));
            }}
          >
            <div style={{ padding: 16, height: '100%', width: '100%', overflowY: 'auto' }}>
              <Row justify="center" style={{ marginBottom: 40 }}>
                <Text type="warning">Preview</Text>
              </Row>
              <Row justify="center">
                <TaskTemplatePreviewPanel
                  value={taskTemplate}
                  debug={debugMode}
                  type="agent"
                />
              </Row>
            </div>
          </Resizable>}
        </div>
        {/* <Layout.Sider theme="light" width="50%" collapsed={!previewSider} collapsedWidth={0} style={{ overflowY: 'auto', marginLeft: 30 }}>

          </Layout.Sider> */}
      </PageContainer>


      <Modal
        visible={preview}
        onOk={() => setPreview(false)}
        onCancel={() => setPreview(false)}
        closable={false}
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
    </LayoutStyled >
    // </PageContainer>

  );
};

TaskTemplatePage.propTypes = {};

TaskTemplatePage.defaultProps = {};

export default withRouter(TaskTemplatePage);
