import React from 'react';
import { Card, Space, Row, Avatar, Form, Col, Modal, Tooltip, Typography, Button } from 'antd';
import Icon, { CloseOutlined, DeleteFilled, DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons'
import { OptionsBuilder } from './OptionsBuilder';
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';
import PropTypes from 'prop-types';
import { TaskTemplateEditorContext } from 'contexts/TaskTemplateEditorContext';
import { VarTag } from 'components/VarTag';
import DocTemplateSelect from 'components/DocTemplateSelect';
import FormBuilder from 'antd-form-builder'
import { showFieldItemEditor } from './showFieldItemEditor';
import {RiDeleteRow} from 'react-icons/ri'

const { Text } = Typography;

export const FieldItemEditor = (props) => {
  const { value: item, index, onDelete, onChange } = props;
  const formRef = React.createRef()
  const handleEditItem = () => {
    showFieldItemEditor(item, onChange);
  }

  const widgetDef = TaskTemplateWidgetDef.find(x => x.type === item.type);
  const name = item.name;

  const meta = React.useMemo(() => ({
    columns: 1,
    fields: [
      {
        key: `${name}.${index}`,
        label: name,
        initialValue: item.value,
        required: item.required,
        extra: item.description,
        options: item.options,
        forwardRef: item.forwardRef,
        widget: widgetDef.widget,
        widgetProps: {
          ...widgetDef.widgetPorps,
          ...(item.type === 'autodoc' ? { mode: 'taskTemplate' } : null)
        }
      }
    ]
  }), [item]);

  const handleDelete = () => {
    Modal.confirm({
      title: <Space><Avatar icon={<Icon component={RiDeleteRow }/>} style={{ backgroundColor: '#cf222e' }} /> Delete field <Text code>{item.name}</Text>?</Space>,
      onOk: () => {
        onDelete();
      },
      icon: null,
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  return <Row wrap={false} gutter={16}>
    <Col flex="auto">
      {/* <Form layout="horizontal" ref={formRef}> */}
        <FormBuilder meta={meta} />
      {/* </Form> */}
    </Col>
    <Col>
      <Button type="link" icon={<EditOutlined />} onClick={handleEditItem}></Button>
      <Button type="link" danger icon={<DeleteOutlined />} onClick={handleDelete}></Button>
      <Button type="text" icon={<HolderOutlined />} style={{cursor: 'move'}}></Button>
    </Col>
  </Row>
};

FieldItemEditor.propTypes = {
  onDelete: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

FieldItemEditor.defaultProps = {
  onChange: () => { },
  editMode: false
};
