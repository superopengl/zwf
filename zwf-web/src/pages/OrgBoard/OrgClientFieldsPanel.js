import { Button } from 'antd';
import React from 'react';
import { useAssertRole } from 'hooks/useAssertRole';
import { Drawer, Form, Typography, Input, Descriptions } from 'antd';
import PropTypes from 'prop-types';
import { ClientNameCard } from 'components/ClientNameCard';
import {FormTemplateSelect} from 'components/FormTemplateSelect';
import { FormSchemaRenderer } from 'components/FormSchemaRenderer';
import { getTaskTemplate$ } from 'services/taskTemplateService';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { Loading } from 'components/Loading';
import { ArrowDownOutlined } from '@ant-design/icons';
import { getOrgClientDatabag$, saveOrgClientDatabag$ } from 'services/clientService';

const { Paragraph } = Typography;

const applyFormTemplateFields = (profileFields, formFields) => {
  if (!formFields) {
    return profileFields;
  }

  const profileSet = new Map(profileFields.map(f => [f.name, f]));

  const ret = [];
  for (const f of formFields) {
    const profileItem = profileSet.get(f.name);
    if (profileItem) {
      f.value = profileItem.value;
    }

    ret.push(f);
  }

  return ret;
}

export const OrgClientFieldsPanel = (props) => {
  useAssertRole(['admin', 'agent']);
  const { fields: propFields, onChange } = props;
  const [loading, setLoading] = React.useState(false);
  const [orgClient, setOrgClient] = React.useState();
  const [femplateId, setFormTemplateId] = React.useState(props.femplateId);
  const [fields, setFields] = React.useState(propFields);

  React.useEffect(() => {
    if (!femplateId) {
      return;
    }
    setLoading(true)
    const sub$ = getTaskTemplate$(femplateId)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(femplate => {
        setFields(applyFormTemplateFields(propFields, femplate?.fields));
      });

    return () => sub$.unsubscribe()
  }, [femplateId])

  const handleFormTemplateChange = (femplateId) => {
    setFormTemplateId(femplateId);
    onChange(femplateId, fields);
  }

  const handleFieldsChange = (changedFields) => {
    setFields(preFields => {
      preFields.forEach(field => {
        if (field.id in changedFields) {
          field.value = changedFields[field.id];
        }
      })

      const upadtedFields = [...preFields];
      onChange(femplateId, upadtedFields);

      return upadtedFields;
    });
  }


  return (
    <Loading loading={loading}>
      <Paragraph type="secondary">Choose a form template to setup profile</Paragraph>
      <FormTemplateSelect
        style={{ width: '100%' }}
        value={femplateId}
        onChange={handleFormTemplateChange}
        allowAdd={true}
      />

      <Paragraph type="secondary" style={{ marginTop: 24, fontSize: 20, textAlign: 'center' }}><ArrowDownOutlined /></Paragraph>
      <Paragraph type="secondary">The default prefilled values in forms associated with this client will be taken from the values stored in this profile</Paragraph>
      {fields && <FormSchemaRenderer fields={fields} mode="profile" onChange={handleFieldsChange} />}
    </Loading>
  )
}

OrgClientFieldsPanel.propTypes = {
  id: PropTypes.string,
  onChange: PropTypes.func,
};

OrgClientFieldsPanel.defaultProps = {
};
