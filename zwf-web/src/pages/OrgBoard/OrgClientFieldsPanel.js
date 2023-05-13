import { Button } from 'antd';
import React from 'react';
import { useAssertRole } from 'hooks/useAssertRole';
import { Drawer, Form, Typography, Space, Row, Col } from 'antd';
import PropTypes from 'prop-types';
import { ClientNameCard } from 'components/ClientNameCard';
import { FemplateSelect } from 'components/FemplateSelect';
import { FormSchemaRenderer } from 'components/FormSchemaRenderer';
import { getFemplate$ } from 'services/femplateService';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { Loading } from 'components/Loading';
import { ArrowDownOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { getOrgClientDatabag$, saveOrgClientDatabag$ } from 'services/clientService';

const { Paragraph, Text } = Typography;

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
    const sub$ = getFemplate$(femplateId)
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
      <Paragraph type="secondary">The default prefilled values in forms associated with this client will be taken from the values stored in this profile</Paragraph>
      <Row wrap={false} gutter={[30, 30]}>
        <Col flex="50%">
          <Row align="top" gutter={[30, 30]}>
            <Col flex="auto">
              <FemplateSelect
                style={{ width: '100%' }}
                value={femplateId}
                onChange={handleFormTemplateChange}
                allowAdd={true}
              />
            </Col>
            <Col>
              <Paragraph type="secondary" style={{ marginTop: 10, fontSize: 20, textAlign: 'center' }}>
                <ArrowRightOutlined />
              </Paragraph>
            </Col>
          </Row>
        </Col>
        <Col flex="50%">
          <ProCard bordered={true}>
          {fields?.length > 0 ? <FormSchemaRenderer 
          fields={fields} 
          requiredMark={false}
          mode="profile" onChange={handleFieldsChange} /> : <Text type="secondary">Start setting profile by selecting a template from the left dropdown.</Text>}
          </ProCard>
        </Col>

      </Row>
    </Loading>
  )
}

OrgClientFieldsPanel.propTypes = {
  id: PropTypes.string,
  onChange: PropTypes.func,
};

OrgClientFieldsPanel.defaultProps = {
};
