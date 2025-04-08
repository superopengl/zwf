import { Button } from 'antd';
import React from 'react';
import { useLocalstorageState } from 'rooks';
import { TaskSearchPanel } from './TaskSearchPanel';
import { useAssertRole } from 'hooks/useAssertRole';
import { Drawer, Space, Form, Typography, Input, Descriptions } from 'antd';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import PropTypes from 'prop-types';
import { ClientNameCard } from 'components/ClientNameCard';
import { OrgClientDataBagPanel } from 'components/OrgClientDataBagPanel';
import TaskTemplateSelect from 'components/TaskTemplateSelect';
import { FormSchemaRenderer } from 'components/FormSchemaRenderer';
import { getTaskTemplate$ } from 'services/taskTemplateService';
import { finalize } from 'rxjs';
import { ProCard } from '@ant-design/pro-components';
import { Loading } from 'components/Loading';
import { ArrowDownOutlined, CaretDownOutlined } from '@ant-design/icons';
import { getOrgClientDataBag$, getOrgClientProfile$, saveOrgClientProfile$ } from 'services/clientService';

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

export const ClientProfileDrawer = (props) => {
  useAssertRole(['admin', 'agent']);
  const { id, open, onClose } = props;
  const [loading, setLoading] = React.useState(true);
  const [orgClient, setOrgClient] = React.useState();
  const [formTemplateId, setFormTemplateId] = React.useState();
  const [fields, setFields] = React.useState([]);
  const ref = React.useRef();

  React.useEffect(() => {
    if (!id) {
      setOrgClient(false);
      return;
    }
    const sub$ = getOrgClientProfile$(id)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(setOrgClient);

    return () => sub$.unsubscribe()
  }, [id])

  React.useEffect(() => {
    setFields(orgClient?.fields ?? []);
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
    const emailForm = ref.current;
    let email;
    if (emailForm) {
      await emailForm.validateFields();
      email = emailForm.getFieldValue('email');
    }

    setLoading(true)
    saveOrgClientProfile$(orgClient.id, email, fields)
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

  const isZwfAccount = !!orgClient?.email;

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
            title="Client information"
          >
            {isZwfAccount ? <>
              <Descriptions column={1} bordered={false} size="small">
                <Descriptions.Item label="Email">{orgClient.email}</Descriptions.Item>
                <Descriptions.Item label="Given Name">{orgClient.givenName}</Descriptions.Item>
                <Descriptions.Item label="Surname">{orgClient.surname}</Descriptions.Item>
                <Descriptions.Item label="Phone">{orgClient.phone}</Descriptions.Item>
              </Descriptions>
            </> : <>
              <Paragraph type="secondary">The client does not have a ZeeWorkflow account. Setting an email address will invite the client to join ZeeWorkflow.</Paragraph>
              <Form ref={ref}>
                <Form.Item name="email" rules={[{ required: false, type: 'email', whitespace: false, max: 100 }]}>
                  <Input allowClear placeholder="Email address" />
                </Form.Item>
              </Form>
            </>}
          </ProCard>
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

ClientProfileDrawer.propTypes = {
  id: PropTypes.string,
};

ClientProfileDrawer.defaultProps = {
};
