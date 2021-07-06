import React from 'react';
import { Row, Col, Typography, Modal, PageHeader, Button } from 'antd';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import { Loading } from 'components/Loading';
import TaskTemplateEditorPanel from './TaskTemplateEditorPanel';
import TaskTemplatePreviewPanel from './TaskTemplatePreviewPanel';

const { Title } = Typography;

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;
`;

const EmptyTaskTamplateSchema = {
  name: 'Task template name',
  description: 'Task template description to clients',
  fields: [
    {
      name: 'Given name',
      description: '',
      type: 'input',
      required: true
    },
    {
      name: 'Gender',
      type: 'radio',
      required: true,
      options: ['Male', 'Female', 'Other']
    },
    {
      name: 'Fiscal year',
      type: 'year',
      required: true,
    },
    {
      name: 'Comment',
      type: 'textarea',
      official: true,
    }
  ]
};


export const TaskTemplateEditorPage = props => {

  const taskTemplateId = props.match.params.id;
  const isNew = !taskTemplateId;

  const [loading, setLoading] = React.useState(!isNew);
  const [preview, setPreview] = React.useState(false);

  const [schema, setSchema] = React.useState(isNew ? EmptyTaskTamplateSchema : null);

  React.useEffect(() => {
    if (!isNew) {
      // Load
    }
  }, []);

  const handleSave = () => {

  }

  if (loading) {
    return <Loading />
  }


  return (
    <LayoutStyled>
      <PageHeader
        title={isNew ? 'New Task Template' : 'Edit Task Template'}
        extra={[
          <Button type="primary" ghost onClick={() => setPreview(true)}>Preview</Button>,
          <Button type="primary" onClick={() => handleSave()}>Save</Button>
        ]}
      >
        <TaskTemplateEditorPanel
          value={schema}
          onChange={schema => {
            setSchema(schema);
          }}
          debug={false}
        />
      </PageHeader>

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
          value={schema}
          debug={false}
          type="agent"
        />
      </Modal>
    </LayoutStyled >
  );
};

TaskTemplateEditorPage.propTypes = {};

TaskTemplateEditorPage.defaultProps = {};

export default withRouter(TaskTemplateEditorPage);
