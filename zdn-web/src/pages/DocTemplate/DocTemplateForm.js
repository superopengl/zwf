import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Input, Button, Form, Typography } from 'antd';
import { saveDocTemplate, getDocTemplate } from 'services/docTemplateService';
import { notify } from 'util/notify';
import { BuiltInFieldDef } from 'components/FieldDef';
import { Loading } from 'components/Loading';
import RickTextInput from 'components/RichTextInput';

const { Paragraph, Text } = Typography;

const EMPTY_TEMPLATE = {
  name: '',
}

const DocTemplateForm = (props) => {

  const { id } = props;
  const editorRef = React.useRef(null);
  const [entity, setEntity] = React.useState(EMPTY_TEMPLATE);
  const [loading, setLoading] = React.useState(true);

  const loadEntity = async () => {
    setLoading(true);
    if (id) {
      const entity = await getDocTemplate(id);
      setEntity(entity);
    }
    setLoading(false);
  }

  React.useEffect(() => {
    loadEntity();
    console.log(editorRef.current?.editor.core);
  }, [])

  const handleSave = async (values) => {
    const { name } = values;
    const newEntity = {
      ...entity,
      ...values
    }
    await saveDocTemplate(newEntity);
    props.onOk();
    notify.success(<>Successfully saved doc template <strong>{name}</strong></>)
  }

  if (loading) {
    return <Loading />
  }

  return (
    // <Space direction="vertical" size="small" style={{ width: '100%' }}>
    <Form onFinish={handleSave} initialValues={entity} style={{ position: 'relative' }}>
      <Form.Item style={{ marginRight: 120 }} name="name" rules={[{ required: true, message: ' ', max: 100 }]}>
        <Input style={{ marginRight: '1rem' }} placeholder="Doc Template Name" />
      </Form.Item>
      <Button style={{ position: 'absolute', right: 0, top: 0, width: 100 }} htmlType="submit" type="primary">Save</Button>
      <Form.Item name="description" rules={[{ required: true, message: ' ' }]}>
        <Input.TextArea allowClear autoSize={{ minRows: 3 }} placeholder="Doc template description. This will be shown on the create task wizard to help users fill required fields to generate this document." />
      </Form.Item>
      <Paragraph type="secondary">
        Refer to <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">https://www.markdownguide.org/basic-syntax/</a> for Markdown basic syntax. Use double curly braces to express the field variables. The variables that can be automatically filled from portfolios are {BuiltInFieldDef.map((f, i) => <Text key={i}><Text code>{`{{${f.name}}}`}</Text>, </Text>)}<Text code>{'{{now}}'}</Text>.
        </Paragraph>
      <Form.Item name="html" rules={[{ required: true, message: ' ' }]}>
       <RickTextInput />
      </Form.Item>
      {/* <Form.Item name="md" rules={[{ required: true, message: ' ' }]}>
        <MarkdownEditor style={{ height: windowHeight - 340 }}
        />
      </Form.Item> */}
    </Form >
    // </Space>
  );
};

DocTemplateForm.propTypes = {
  id: PropTypes.string,
};

DocTemplateForm.defaultProps = {
};

export default withRouter(DocTemplateForm);
