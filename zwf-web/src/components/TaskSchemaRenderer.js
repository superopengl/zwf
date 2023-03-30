import React from 'react';
import PropTypes from 'prop-types';
import { BetaSchemaForm } from '@ant-design/pro-components';
import { generateSchemaFromColumns } from 'util/TaskTemplateFieldControlDef';
import styled from 'styled-components';

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

export const TaskSchemaRenderer = React.memo(React.forwardRef((props, ref) => {

  const { fields, mode, onChange, disabled, onSubmit } = props;

  // fields.sort((a, b) => a.ordinal - b.ordinal);

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

  // console.log(fieldSchema)

  return <Container>
    <BetaSchemaForm
      layoutType='Form'
      formRef={ref}
      columns={fieldSchema}
      onValuesChange={handleFormValueChange}
      // onFinish={handleSubmit}
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
        render: () => null
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

