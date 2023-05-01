import { Button } from 'antd';
import React from 'react';
import { useAssertRole } from 'hooks/useAssertRole';
import { Drawer, Form, Typography, Input, Descriptions } from 'antd';
import PropTypes from 'prop-types';
import { ClientNameCard } from 'components/ClientNameCard';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
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

export const ClientDatabagDrawer = (props) => {
  useAssertRole(['admin', 'agent']);
  const { id, open, onClose } = props;
  const [loading, setLoading] = React.useState(true);
  const [orgClient, setOrgClient] = React.useState();
  const [formTemplateId, setFormTemplateId] = React.useState();
  const [fields, setFields] = React.useState([]);

  React.useEffect(() => {
    if (!id) {
      setOrgClient(false);
      return;
    }
    const sub$ = getOrgClientDatabag$(id)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(setOrgClient);

    return () => sub$.unsubscribe()
  }, [id])

  React.useEffect(() => {
    setFields(orgClient?.fields ?? []);
    setFormTemplateId(orgClient?.formTemplateId);
  }, [orgClient])

  React.useEffect(() => {
    if (!formTemplateId) {
      return;
    }
    setLoading(true)
    const sub$ = getTaskTemplate$(formTemplateId)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(taskTemplate => {
        setFields(applyFormTemplateFields(orgClient.fields, taskTemplate?.fields));
      });

    return () => sub$.unsubscribe()
  }, [formTemplateId])

  const handleSave = async () => {

    setLoading(true)
    saveOrgClientDatabag$(orgClient.id, fields)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe({
        next: () => onClose()
      });
  }

  const handleFormTemplateChange = (formTemplateId) => {
    setFormTemplateId(formTemplateId);
  }

  const handleDataBagChange = (changedFields) => {
    setFields(preFields => {
      preFields.forEach(field => {
        if (field.id in changedFields) {
          field.value = changedFields[field.id];
        }
      })

      return [...preFields];
    });
  }


  return (
    <Drawer
      open={open}
      closable={false}
      onClose={onClose}
      title={<ClientNameCard id={orgClient?.id} allowChangeAlias={true} />}
      destroyOnClose
      placement='right'
      footer={<Button type="primary" onClick={handleSave}>Save</Button>}
      bodyStyle={{ padding: 0 }}
    >
      <Loading loading={loading}>
        <ProCard split={'horizontal'} gutter={[0, 20]}>
          <ProCard
            title="Client databag"
          >
            <Paragraph type="secondary">Choose a form template to setup databag</Paragraph>
            <TaskTemplateSelect
              style={{ width: '100%' }}
              value={formTemplateId}
              onChange={handleFormTemplateChange}
            />

            <Paragraph type="secondary" style={{ marginTop: 24, fontSize: 20, textAlign: 'center' }}><ArrowDownOutlined /></Paragraph>
            <Paragraph type="secondary">The values stored in this databag can be used as default prefilled values in forms associated with this client</Paragraph>
            {fields && <FormSchemaRenderer fields={fields} mode="profile" onChange={handleDataBagChange} />}
          </ProCard>
        </ProCard>
      </Loading>
    </Drawer>
  )
}

ClientDatabagDrawer.propTypes = {
  id: PropTypes.string,
};

ClientDatabagDrawer.defaultProps = {
};
