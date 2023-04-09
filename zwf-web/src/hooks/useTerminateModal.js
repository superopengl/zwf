import React from 'react';
import { Modal, Typography, Form, Input, Space, Button } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { TaskGenerator } from 'pages/MyTask/TaskGenerator';
import { BsFillNutFill } from 'react-icons/bs';
import Icon, { CloseCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import { Checkbox } from 'antd';
import { terminateOrg$ } from 'services/orgService';
import { useAuthUser } from './useAuthUser';
import { finalize } from 'rxjs';
import { Loading } from 'components/Loading';

const { Paragraph, Text } = Typography;

const SurveyPanel = props => {
  const { onCancel, onOk } = props;
  const [loading, setLoading] = React.useState(false);
  const [user, setAuthUser] = useAuthUser();

  const handleSubmit = (values) => {
    setLoading(true);
    terminateOrg$(values).pipe(
      finalize(() => setLoading(false))
    ).subscribe(() => {
      onOk();
      setAuthUser(null, '/');
    })
  }

  return <Loading loading={loading}>
    <Form
      layout="vertical"
      requiredMark={false}
      onFinish={handleSubmit}
    >
      <Form.Item label="Reasons" name="reasons" rules={[{ required: true, type: 'array' }]}>
        <Checkbox.Group options={[
          'Not useful as expected',
          'Too many bugs',
          'Poor user experience',
          'Too expensive',
          'Poor customer support',
          'Other reason'
        ]} name="checked"
          style={{ flexDirection: 'column' }}
        />
      </Form.Item>
      <Form.Item label="Feedback" name="feedback" rules={[{ max: 1000 }]}>
        <Input.TextArea placeholder='Tell us your feedback' allowClear />
      </Form.Item>
      <Form.Item>
        <Space style={{width: '100%', justifyContent: 'end'}}>
          <Button type="text" onClick={onCancel}>Cancel</Button>
          <Button type="primary" danger htmlType="submit">Terminate Subscription</Button>
        </Space>
      </Form.Item>
    </Form>
  </Loading>
}

export const useTerminateModal = () => {
  const [confirmModal, confirmContextHolder] = Modal.useModal();
  const [surveyModal, surveyContextHolder] = Modal.useModal();
  
  const openSurveyModal = () => {
    const surveyModalInstance = surveyModal.confirm({
      icon: <InfoCircleFilled style={{ color: '#F53F3F' }} />,
      title: <>Tell us more</>,
      maskClosable: false,
      closable: true,
      destroyOnClose: true,
      focusTriggerAfterClose: false,
      footer: null,
      content: <SurveyPanel
        onOk={() => surveyModalInstance.destroy()}
        onCancel={() => surveyModalInstance.destroy()} />
    });
  }

  const open = () => {
    confirmModal.confirm({
      icon: <CloseCircleFilled style={{ color: '#F53F3F' }} />,
      title: <>Terminate Subscription</>,
      maskClosable: false,
      closable: true,
      destroyOnClose: true,
      focusTriggerAfterClose: false,
      okText: 'Yes, Terminate Subscription',
      okButtonProps: {
        type: 'primary',
        danger: true,
      },
      cancelButtonProps: {
        type: 'text'
      },
      onOk: () => {
        openSurveyModal();
      },
      autoFocusButton: 'cancel',
      content: <Paragraph>
        Terminate the subscription and delete all accounts linked with this organization immediately. Please note that this action is irreversible. Additionally, for the sake of privacy protection, all assets exclusively linked to this organization will be permanently erased from ZeeWorkflow. We highly advise that you create a backup of all essential information before proceeding.
      </Paragraph>
    });

  }

  return [open, <>
    <div>{confirmContextHolder}</div>
    {surveyContextHolder}
  </>];
};
