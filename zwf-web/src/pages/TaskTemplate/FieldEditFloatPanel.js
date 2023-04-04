import PropTypes from 'prop-types';
import { Tooltip, Form, Switch, Input, Button, Typography, Space } from 'antd';
import { ProCard } from '@ant-design/pro-components';
import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { OptionsBuilder } from './formBuilder/OptionsBuilder';
import DocTemplateSelect from 'components/DocTemplateSelect';

const { Text, Title, Paragraph } = Typography;


export const FieldEditFloatPanel = (props) => {
  const { field, onChange, trigger, children, onDelete, ...others } = props;
  const [deleting, setDeleting] = React.useState(field.type === 'divider');

  React.useEffect(() => {
    setDeleting(field.type === 'divider')
  }, [field])

  const handleValuesChange = (changedValues, allValues) => {
    onChange({ ...field, ...changedValues });
  }

  const handleDeleteField = () => {
    setDeleting(true);
  };

  return <Tooltip
    {...others}
    // open={open}
    // arrow={false}
    align={{ offset: [28, 0], targetOffset: [0, 0] }}
    zIndex={1600}
    placement="rightTop"
    color="white"
    trigger={trigger}
    overlayInnerStyle={{ width: 300, padding: 0 }}
    title={<div style={{ padding: 0 }}>
      {/* <DebugJsonPanel value={field} /> */}

      {deleting ? <ProCard>
        <Space align='center'>
          {/* <Avatar icon={<Icon component={CloseOutlined} />} style={{ backgroundColor: '#F53F3F' }} /> */}
          <Paragraph>Are you sure you want to delete {field.type === 'divider' ? 'this divider' : <>field <Text strong>{field.name}</Text></>}?</Paragraph>
        </Space>
        <Space style={{justifyContent: 'end', width: '100%'}}>
          {field.type !== 'divider' && <Button type="text" autoFocus onClick={() => setDeleting(false)}>Cancel</Button>}
          <Button type="primary" danger icon={<CloseOutlined />} onClick={onDelete}>Delete</Button>
        </Space>
      </ProCard> : <ProCard split={'horizontal'} >
        <ProCard>
          <Form
            layout="vertical"
            initialValues={field}
            onValuesChange={handleValuesChange}
            autoComplete="off"
          >
            {/* <Form.Item name="name" label="Field Name">
            <Input.TextArea allowClear />
          </Form.Item> */}
            {field.type === 'autodoc' && <Form.Item
              label="Doc Template"
              name={['value', 'docTemplateId']}
              rules={[{ required: true, message: ' ' }]}
            >
              <DocTemplateSelect showVariables={true} isMultiple={false} />
            </Form.Item>}
            <Form.Item name="name" label="Field name" required>
              <Input />
            </Form.Item>
            {field.type !== 'instruction' && <Form.Item name="required" label="Required" valuePropName="checked">
              <Switch />
            </Form.Item>}
            <Form.Item name="official" label="Official only" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea allowClear showCount maxLength={field.type === 'instruction' ? 1000 : 200} autoSize={{ minRows: 3 }} />
            </Form.Item>
            {['radio', 'select'].includes(field.type) &&
              <Form.Item label="Options"
                name='options'
                rules={[{
                  validator: async (rule, options) => {
                    if (!options?.every(x => x?.trim().length)) {
                      throw new Error('Options are not defined');
                    }
                  }
                }]}
              >
                <OptionsBuilder />
              </Form.Item>}
          </Form>
        </ProCard>
        <ProCard>
          <Button danger block type="primary" icon={<CloseOutlined />} onClick={handleDeleteField}>Delete</Button>
        </ProCard>
      </ProCard>
      }
    </div>}
  >
    {children}
  </Tooltip>
}


FieldEditFloatPanel.propTypes = {
  field: PropTypes.object,
  onChange: PropTypes.func,
  onDelete: PropTypes.func,
  trigger: PropTypes.oneOf(['hover', 'click']),
};

FieldEditFloatPanel.defaultProps = {
  field: {},
  onChange: () => { },
  onDelete: () => { },
  trigger: 'click'
};