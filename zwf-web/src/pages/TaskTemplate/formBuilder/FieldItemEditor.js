import React from 'react';
import { Card, Switch, Row, Input, Form, Col, Select, Tooltip, Typography, Button } from 'antd';
import Icon, { CloseOutlined, DeleteFilled, DeleteOutlined, EditOutlined, HolderOutlined } from '@ant-design/icons'
import { OptionsBuilder } from './OptionsBuilder';
import { TaskTemplateWidgetDef } from 'util/taskTemplateWidgetDef';
import PropTypes from 'prop-types';
import { TaskTemplateEditorContext } from 'contexts/TaskTemplateEditorContext';
import { VarTag } from 'components/VarTag';
import DocTemplateSelect from 'components/DocTemplateSelect';
import FormBuilder from 'antd-form-builder'
import { showFieldItemEditor } from './showFieldItemEditor';

const { Text } = Typography;

export const FieldItemEditor = (props) => {
  const { value, index, onDelete, onChange } = props;

  const handleEditItem = () => {
    showFieldItemEditor(value, onChange);
  }

  const widgetDef = TaskTemplateWidgetDef.find(x => x.type === value.type);
  const name = value.name;

  const meta = React.useMemo(() => ({
    columns: 1,
    fields: [
      {
        key: `${name}.${index}`,
        label: name,
        required: value.required,
        extra: value.description,
        options: value.options,
        forwardRef: value.forwardRef,
        widget: widgetDef.widget,
        widgetProps: {
          ...widgetDef.widgetPorps,
          style: {
            ...widgetDef.widgetPorps?.style,
            // pointerEvents: 'none',
          },
          // onClick: () => {}
        }
      }
    ]
  }), [value]);

  return <Row wrap={false} gutter={16}>
    <Col flex="auto">
      <FormBuilder meta={meta} />
    </Col>
    <Col>
      <Button type="link" icon={<EditOutlined />} onClick={handleEditItem}></Button>
      <Button type="link" danger icon={<DeleteOutlined />} onClick={onDelete}></Button>
      <Tooltip title="Drag to adjust order">
        <Button type="text" icon={<HolderOutlined />}></Button>
      </Tooltip>
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
