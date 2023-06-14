import {
  DeleteOutlined, EditOutlined, PlusOutlined
} from '@ant-design/icons';
import { Button, Drawer, Row, Col, Modal, Space, Table, Tooltip, Typography, Form } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import TaskTemplateForm from 'pages/TaskTemplate/TaskTemplateForm';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { deleteTaskTemplate, listTaskTemplate } from 'services/taskTemplateService';
import styled from 'styled-components';
import FormBuilder from 'antd-form-builder'
import { TaskTemplateBuilder } from 'components/formBuilder/TaskTemplateBuilder';
import { Loading } from 'components/Loading';
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';

const { Title, Paragraph } = Typography;

const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;
const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

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
    }
  ]
  // fields: [
  //   {
  //     key: 'obj.input',
  //     label: 'Input',
  //     name: ['obj', 'input'],
  //     required: true,
  //     extra: 'blah',
  //     tooltip: 'This is the tooltip.',
  //   },
  //   { key: 'checkbox', label: 'Checkbox', widget: 'checkbox' },
  //   { key: 'switch', label: 'Switch', widget: 'switch', initialValue: true },
  //   { key: 'select', label: 'Select', widget: 'select', options: ['Apple', 'Orange', 'Banana'] },
  //   {
  //     key: 'checkbox-group',
  //     label: 'Checkbox Group',
  //     widget: 'checkbox-group',
  //     options: ['Apple', 'Orange', 'Banana'],
  //   },
  //   {
  //     key: 'radio-group',
  //     label: 'Radio Group',
  //     widget: 'radio',
  //     forwardRef: true,
  //     options: ['Apple', 'Orange', 'Banana'],
  //   },
  //   {
  //     key: 'radio-button-group',
  //     label: 'Radio Button Group',
  //     widget: 'radio-group',
  //     buttonGroup: true,
  //     forwardRef: true,
  //     options: ['Apple', 'Orange', 'Banana'],
  //   },
  //   { key: 'textarea', label: 'Textarea', widget: 'textarea' },
  //   { key: 'date-picker', label: 'Date Picker', widget: 'date-picker' },
  // ]
};

const convertTaskTemplateFieldsToFormFieldsSchema = (ttFields) => {
  return ttFields.map(t => {
    const widgetDef = TaskTemplateWidgetDef.find(x => x.type === t.type);
    return {
      key: t.name,
      label: t.name,
      name: t.name,
      required: t.required,
      extra: t.description,
      options: t.options,
      widget: widgetDef.widget,
      widgetProps: widgetDef.widgetPorps
    }
  });
}

export const TaskTemplateBuilderPage = props => {

  const taskTemplateId = props.match.params.id;
  const isNew = !taskTemplateId;

  const [loading, setLoading] = React.useState(!isNew);
  const [currentId, setCurrentId] = React.useState(taskTemplateId);

  const [schema, setSchema] = React.useState(isNew ? EmptyTaskTamplateSchema : null);
  const previewFormRef = React.createRef();

  React.useEffect(() => {
    if (!isNew) {
      // Load
    }
  }, []);

  if (loading) {
    return <Loading />
  }

  return (
    <LayoutStyled>
      <Title>{!currentId ? 'New Task Template' : 'Edit Task Template'}</Title>
      <Row gutter={[10, 10]}>
        <Col span={12}>
          <TaskTemplateBuilder
            formStructure={schema}
            onChange={schema => {
              setSchema(schema);
            }}
            onError={error => console.log(error)}
          />
          <pre>{JSON.stringify(schema, null, 2)}</pre>
        </Col>
        <Col span={12}>
          <Title level={3}>{schema.name}</Title>
          <Paragraph type="secondary">{schema.description}</Paragraph>
          <Form
            ref={previewFormRef}
            layout="horizontal"
          >
            <FormBuilder meta={convertTaskTemplateFieldsToFormFieldsSchema(schema.fields)} form={previewFormRef} />
          </Form>
          <pre>{JSON.stringify(convertTaskTemplateFieldsToFormFieldsSchema(schema.fields), null, 2)}</pre>

        </Col>
      </Row>


    </LayoutStyled >
  );
};

TaskTemplateBuilderPage.propTypes = {};

TaskTemplateBuilderPage.defaultProps = {};

export default withRouter(TaskTemplateBuilderPage);
