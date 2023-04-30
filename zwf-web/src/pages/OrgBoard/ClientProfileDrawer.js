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

const { Paragraph } = Typography;


export const ClientProfileDrawer = (props) => {
  useAssertRole(['admin', 'agent']);
  const { value: orgClient, onSave, open, onClose } = props;
  const [loading, setLoading] = React.useState(false);
  const [formTemplateId, setFormTemplateId] = React.useState();
  const [fields, setFields] = React.useState();

  React.useEffect(() => {
    if (!formTemplateId) {
      return;
    }
    const sub$ = getTaskTemplate$(formTemplateId)
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(taskTemplate => {
        setFields(taskTemplate?.fields)
      });

    return () => sub$.unsubscribe()
  }, [formTemplateId])

  const handleSave = () => {
    onClose();
  }

  const handleFormTemplateChange = (formTemplateId) => {
    setLoading(true)
    setFormTemplateId(formTemplateId);
  }

  const isZwfAccount = !!orgClient?.email;

  return (
    <Drawer
      open={open}
      closable={false}
      onClose={onClose}
      title={<ClientNameCard id={orgClient?.id} allowChangeAlias={true}/>}
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
              <Form>
                <Form.Item name="email" rules={[{ required: true, type: 'email', max: 100 }]}>
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
            {fields && <FormSchemaRenderer fields={fields} mode="profile" />}
          </ProCard>
        </ProCard>
      </Loading>
    </Drawer>
  )
}

ClientProfileDrawer.propTypes = {
  value: PropTypes.object,
};

ClientProfileDrawer.defaultProps = {
  value: {}
};
