import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Form, Divider, Space, Tooltip } from 'antd';
import FormBuilder from 'antd-form-builder'
import { DocTemplateListPanel } from 'components/DocTemplateListPanel';
import { createFormSchemaFromFields, generateFormSchemaFromFields } from 'util/createFormSchemaFromFields';
import { GlobalContext } from '../contexts/GlobalContext';
import { BetaSchemaForm, ProFormSelect } from '@ant-design/pro-components';
import { generateSchemaFromColumns } from 'util/TaskTemplateFieldControlDef';
import Field from '@ant-design/pro-field';
import styled from 'styled-components';
import { DeleteOutlined, LockFilled, HolderOutlined, EyeInvisibleFilled } from '@ant-design/icons';

const Container = styled.div`
.ant-form-item {
  margin-bottom: 0;
}

.ant-form-item-label {
  margin-top: 1rem;
}

.ant-space {
  margin-top: 2rem;
  width: 100%;
  justify-content: end;
}
`;

const { Title, Text, Paragraph } = Typography;

export const TaskSchemaRenderer = React.memo(React.forwardRef((props, ref) => {

  const { fields, mode, onChange, disabled, onSubmit } = props;
  const context = React.useContext(GlobalContext);
  const role = context.role;

  fields.sort((a, b) => a.ordinal - b.ordinal);

  const fieldSchema = React.useMemo(() => {
    const schema = generateSchemaFromColumns(fields, mode);
    schema?.forEach(f => {
      // f.required = false;
      f.fieldProps.disabled = disabled;
    });
    return schema;
  }, [fields, disabled, mode]);

  const handleFormValueChange = (changedValues, allValues) => {
    onChange(changedValues);
  }

  const handleSubmit = (values) => {
    onSubmit(values);
  }

  console.log(fieldSchema)

  return <Container>
    <BetaSchemaForm
      layoutType='Form'
      formRef={ref}
      columns={fieldSchema}
      onValuesChange={handleFormValueChange}
      onFinish={handleSubmit}
      submitter={{
        searchConfig: {
          resetText: 'Reset',
          submitText: 'Submit',
        },
        resetButtonProps: {
          type: 'text',
        },
        submitButtonProps: {
          block: true
        },
        // render: () => null
      }}
    />
    {/* <Divider />
    <Field valueType="jsonCode" text={JSON.stringify(fieldSchema)} /> */}
  </Container>
}));

TaskSchemaRenderer.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object).isRequired,
  readonly: PropTypes.bool,
  disabled: PropTypes.bool,
  mode: PropTypes.oneOf(['agent', 'client']),
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
};

TaskSchemaRenderer.defaultProps = {
  readonly: false,
  disabled: false,
  mode: 'agent',
  onChange: (fieldId, newValue) => { },
  onSubmit: () => { },
};

