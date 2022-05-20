import React from 'react';
import { Card, Switch, Row, Input, Col, Select, Form, Typography, Button, Modal, Divider } from 'antd';
import Icon, { CloseOutlined, DeleteFilled, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { OptionsBuilder } from './OptionsBuilder';
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';
import PropTypes from 'prop-types';
import { TaskTemplateEditorContext } from 'contexts/TaskTemplateEditorContext';
import { VarTag } from 'components/VarTag';
import DocTemplateSelect from 'components/DocTemplateSelect';
import FormBuilder from 'antd-form-builder'

const { Text } = Typography;

const DEFAULT_FIELD = {
  name: 'Unnamed field',
  type: 'input'
}

const formItemLayoutProps = {
  // labelCol: { span: 6 },
  // wrapperCol: { span: 18 },
}

const FieldEditModalContent = (props) => {
  const { value, onChange, onCancel } = props;

  const [item, setItem] = React.useState(value || DEFAULT_FIELD);
  const editorContext = React.useContext(TaskTemplateEditorContext);

  const handleFormValuesChange = (changedValue, allValues) => {
    setItem(allValues)
  }

  const handleFormSubmit = (formValues) => {
    debugger;
    const changed = {
      ...value,
      ...formValues,
    };
    onChange(changed);
  }

  return (
    <Form
      style={{marginTop: 32}}
      initialValues={item}
      onFinish={handleFormSubmit}
      onValuesChange={handleFormValuesChange}
      // layout="vertical"
      labelCol={{span: 6}}
      wrapperCol={{span: 18}}
    >
      <Form.Item label="Field name"
        {...formItemLayoutProps}
        name='name'
        rules={[{ required: true, whitespace: true, message: ' ', max: 50 }]}>
        <Input placeholder="" allowClear maxLength={100} />
      </Form.Item>
      <Form.Item label="Type"
        {...formItemLayoutProps}
        name='type'
        rules={[{ required: true, message: ' ' }]}>
        <Select >
          {TaskTemplateWidgetDef.map((d, i) => <Select.Option key={i} value={d.type}>
            <Icon component={() => d.icon} />
            <span style={{ marginLeft: 10 }}>{d.label}</span>
          </Select.Option>)}
        </Select>
      </Form.Item>
      {!['upload', 'autodoc'].includes(item.type) && <Form.Item label="Variable"
        {...formItemLayoutProps}
        name='varName'
        rules={[{ required: false }]}>
        <Select
          allowClear
          bordered={true}
          options={editorContext.vars.map(v => ({
            label: <VarTag>{v}</VarTag>,
            value: v
          }))} />
      </Form.Item>}
      <Form.Item label="Required"
        {...formItemLayoutProps}
        valuePropName="checked" name='required'>
        <Switch />
      </Form.Item>
      <Form.Item label="Official only"
        {...formItemLayoutProps}
        valuePropName="checked" name='official'>
        <Switch />
      </Form.Item>
      <Form.Item label="Description"
        {...formItemLayoutProps}
        name='description'
        rules={[{ required: false, whitespace: true, message: ' ', max: 300 }]}>
        <Input.TextArea
          placeholder="Add description"
          maxLength={1000}
          showCount
          allowClear
          autosize={{ minRows: 3, maxRows: 20 }} />
      </Form.Item>
      {['radio', 'checkbox', 'select'].includes(item.type) &&
        <Form.Item label="Options"
          {...formItemLayoutProps}
          name='options'
          rules={[{
            validator: async (rule, options) => {
              if (!options?.every(x => x?.trim().length)) {
                throw 'Options are not defined';
              }
            }
          }]}
        >
          <OptionsBuilder />
        </Form.Item>}
      {item.type === 'autodoc' && <Form.Item
        label="Doc Template"
        {...formItemLayoutProps}
        name={['value', 'docTemplateId']}
        rules={[{ required: true, message: ' ' }]}
      >
        <DocTemplateSelect isMultiple={false} />
      </Form.Item>}
      <Row justify="end" style={{marginTop: 32}}>
        <Button type="text" onClick={onCancel} >Cancel</Button>
        <Button type="primary" htmlType="submit" style={{marginLeft: 16}}>Save</Button>
      </Row>
    </Form>
  );
}

FieldEditModalContent.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
};

FieldEditModalContent.defaultProps = {
  onChange: () => { },
};

export function showFieldItemEditor(item, onOk) {
  const modalRef = Modal.info({
    title: <>Edit field <Text code>{item.name}</Text></>,
    content: <FieldEditModalContent
      value={item}
      onChange={(updatedItem) => {
        modalRef.destroy();
        onOk(updatedItem);
      }}
      onCancel={() => modalRef.destroy()}
    />,
    afterClose: () => {
    },
    icon: null,
    width: 500,
    // icon: <Icon component={() => <EditOutlined />} />,
    closable: true,
    maskClosable: false,
    destroyOnClose: true,
    footer: null,
    focusTriggerAfterClose: true,
    okText: 'Done',
    autoFocusButton: null,
    okButtonProps: {
      style: {
        display: 'none'
      }
    }
  });

  return modalRef;
}