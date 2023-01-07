import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, PageHeader, Space, Layout, Drawer, Typography, Radio, Row, Col } from 'antd';
import HomeHeader from 'components/HomeHeader';
import FieldEditor from 'components/FieldEditor';
import { Divider } from 'antd';
import { getTask, saveTask } from '../../services/taskService';
import { varNameToLabelName } from 'util/varNameToLabelName';
import { DateInput } from 'components/DateInput';
import { RangePickerInput } from 'components/RangePickerInput';
import { Select } from 'antd';
import { SyncOutlined, MessageOutlined } from '@ant-design/icons';
import { notify } from 'util/notify';
import { merge } from 'lodash';
import { TaskDocEditor } from './TaskDocEditor';
import TaskChatPanel from './TaskChatPanel';
import { TaskStatus } from 'components/TaskStatus';
import * as queryString from 'query-string';
import { Loading } from 'components/Loading';
import TaskCommentPanel from './TaskCommentPanel';

const { Text, Title } = Typography;
const ContainerStyled = styled.div`
  margin: 5rem auto 0 auto;
  padding: 1rem;
  // max-width: 900px;
  width: 100%;
  display: flex;

  .ant-page-header-heading-left {
    flex: 1;
  }

  .ant-page-header-heading-title {
    width: 100%;

    .task-name-input {
      font-weight: 700;
    }
  }
`;


const StyledDrawer = styled(Drawer)`
.ant-drawer-content-wrapper {
  max-width: 90vw;
}
`;

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;

  .ant-page-header {
    padding: 0;
  }
`;

const StatusSelect = styled(Select)`
&.archive {
  .ant-select-selector {
    background: #ff4d4f;
    border-color: #ff4d4f;
  }

  * {
    color: #ffffff;
  }
}

&.complete {
  .ant-select-selector {
    background: #52c41a;
    border-color: #52c41a;
  }

  * {
    color: #ffffff;
  }
}

&.signed, &.to_sign, &.todo {
  .ant-select-selector {
    background: #1890ff;
    border-color: #1890ff;
  }

  * {
    color: #ffffff;
  }
}
`

const ProceedTaskPage = (props) => {
  const id = props.match.params.id;
  // const { name, id, fields } = value || {};
  const { chat } = queryString.parse(props.location.search);

  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [editingFields, setEditingFields] = React.useState();
  const [form] = Form.useForm();
  const [chatVisible, setChatVisible] = React.useState(Boolean(chat));

  const [task, setTask] = React.useState();

  const toggleChatPanel = () => {
    setChatVisible(!chatVisible);
  }

  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const task = await getTask(id);
      setTask(task);
      setStatusValue({ value: defaultStatus[task.status] })
    }
    setLoading(false);
  }

  const initialLoadEntity = React.useCallback(() => loadEntity());

  React.useEffect(() => {
    initialLoadEntity();
  }, [])

  const handleValuesChange = (changedValues) => {
    const changedTask = merge(task, changedValues);
    setTask({ ...changedTask });
  }

  const handleSubmit = async (values) => {
    setLoading(true);
    await saveTask({
      ...task,
      ...values,
      fields: merge(task.fields, values.fields)
    });
    notify.success('Successfully saved');
    setLoading(false);
  }

  const handleCancel = () => {
    props.history.push('/tasks');
  }


  const handleStatusChange = async option => {
    const value = option?.value;
    if (!value) return;
    if (value !== task.status) {
      task.status = value;
      setLoading(true);
      try {
        await saveTask(task);
      } finally {
        await loadEntity();
        setLoading(false);
      }
    }
  }

  const handleFieldChange = async value => {
    setEditingFields(value);
  }

  const handleSaveFieldChange = () => {
    task.fields = editingFields;
    setTask({ ...task });
    setDrawerVisible(false);
  }

  const status = task?.status;
  const defaultStatus = {
    todo: 'To Do',
    to_sign: 'To Sign',
    signed: 'Signed',
    complete: 'Complete',
    archive: 'Archive'
  };

  const [statusValue, setStatusValue] = React.useState({ value: defaultStatus[status] });

  const options = [
    { value: 'todo', label: 'To Do' },
    { value: 'to_sign', label: 'To Sign' },
    { value: 'signed', label: 'Signed' },
    { value: 'complete', label: <Text type="success">Complete</Text> },
    { value: 'archive', label: <Text type="danger">Archive</Text> },
  ];

  const handleModifyFields = () => {
    setDrawerVisible(true);
  }


  const handleTaskDocsChange = (docs) => {
    task.docs = docs;
    setTask({ ...task });
  }

  const handleSave = () => {
    form.submit();
  }


  return (<LayoutStyled>
    <HomeHeader></HomeHeader>
    <ContainerStyled>
      {!task ? <Loading /> : <div style={{ width: '100%' }}>

        <PageHeader
          onBack={() => handleCancel()}
          title={<TaskStatus status={task.status} avatar={false} width={60} />}
          // subTitle={<TaskProgressBar status={task.status} width={60} />}
          extra={[
            <Space key="1" style={{ width: '100%', justifyContent: 'flex-end' }}>


              <Button type="primary" ghost disabled={loading} icon={<SyncOutlined />} onClick={() => loadEntity()}></Button>
              <Button type="primary" ghost disabled={loading} onClick={() => handleModifyFields()}>Modify Fields</Button>
              <Button type="primary" ghost={chatVisible} disabled={loading} icon={<MessageOutlined />} onClick={() => toggleChatPanel()}></Button>
              <Button type="primary" onClick={() => handleSave()} disabled={loading}>Save</Button>
              <StatusSelect value={statusValue}
                labelInValue={true}
                style={{ width: 120 }}
                className={status}
                onChange={handleStatusChange}
              >
                {options
                  .filter(x => x.value !== status)
                  .map((x, i) => <Select.Option key={i} value={x.value}>{x.label}</Select.Option>)}
              </StatusSelect>
            </Space>,
          ]}
        />
        <Divider />
        <Layout style={{ backgroundColor: '#ffffff', height: '100%' }}>
          <Layout.Content style={{ padding: '0' }}>
            <Row gutter={20}>
              <Col flex="auto">
                <Title level={3}>Fields</Title>
                <Form
                  form={form}
                  layout="vertical"
                  onValuesChange={handleValuesChange}
                  onFinish={handleSubmit}
                  style={{ textAlign: 'left', width: '100%' }}
                  initialValues={task}
                >
                  <Form.Item name="name" label="Task Name" rules={[{ required: true, message: ' ' }]}>
                    <Input className="task-name-input" placeholder="Task name" disabled={loading} style={{ fontWeight: 600 }} />
                  </Form.Item>
                  {task.fields.map((field, i) => {
                    const { name, description, required, type } = field;
                    const formItemProps = {
                      label: <>{varNameToLabelName(name)}{description && <Text type="secondary"> ({description})</Text>}</>,
                      name: ['fields', i, 'value'],
                      rules: [{ required }]
                    }
                    return (
                      <Form.Item key={i} {...formItemProps}>
                        {type === 'text' ? <Input disabled={loading} /> :
                          type === 'year' ? <DateInput picker="year" placeholder="YYYY" disabled={loading} /> :
                            type === 'monthRange' ? <RangePickerInput picker="month" disabled={loading} /> :
                              type === 'number' ? <Input disabled={loading} type="number" /> :
                                type === 'paragraph' ? <Input.TextArea disabled={loading} /> :
                                  type === 'date' ? <DateInput picker="date" disabled={loading} placeholder="DD/MM/YYYY" style={{ display: 'block' }} format="DD/MM/YYYY" /> :
                                    type === 'select' ? <Radio.Group disabled={loading} buttonStyle="solid">
                                      {field.options?.map((x, i) => <Radio key={i} style={{ display: 'block', height: '2rem' }} value={x.value}>{x.label}</Radio>)}
                                    </Radio.Group> :
                                      null}
                      </Form.Item>
                    );
                  })}
                </Form>
              </Col>
              <Col flex="auto">
                <Title level={3}>Attachments</Title>
                <TaskDocEditor value={task.docs} fields={task.fields} onChange={handleTaskDocsChange} />
                <Title level={3} style={{ marginTop: '2rem' }}>Comments</Title>
                <TaskCommentPanel taskId={task.id} />
              </Col>
            </Row>
          </Layout.Content>
          <Layout.Sider collapsed={!chatVisible} reverseArrow={true} collapsedWidth={0} width={400} collapsible={false} theme="light" style={{ paddingLeft: 20, height: '100%' }}>
            <Title level={3}>Messages</Title>
            <TaskChatPanel taskId={task.id} />
          </Layout.Sider>
        </Layout>
      </div>
      }
    </ContainerStyled>

    <StyledDrawer
      title="Modify Task Fields"
      placement="right"
      closable={true}
      visible={drawerVisible}
      onClose={() => setDrawerVisible(false)}
      destroyOnClose={true}
      width={900}
      footer={null}
    >
      <FieldEditor value={task?.fields} onChange={handleFieldChange} />
      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button type="link" onClick={() => setDrawerVisible(false)}>Cancel</Button>
        <Button type="primary" onClick={() => handleSaveFieldChange()}>Save</Button>
      </Space>
    </StyledDrawer>
  </LayoutStyled >

  );
};

ProceedTaskPage.propTypes = {
  id: PropTypes.string
};

ProceedTaskPage.defaultProps = {};

export default withRouter(ProceedTaskPage);
