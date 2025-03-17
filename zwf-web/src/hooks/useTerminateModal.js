import React from 'react';
import { Modal, Typography, Form, Input, Space, Button, Row, Col } from 'antd';
import { TaskIcon } from 'components/entityIcon';
import { TaskGenerator } from 'pages/MyTask/TaskGenerator';
import { BsFillNutFill } from 'react-icons/bs';
import Icon, { CloseCircleFilled, InfoCircleFilled } from '@ant-design/icons';
import { Checkbox } from 'antd';
import { terminateOrg$ } from 'services/orgService';
import { useAuthUser } from './useAuthUser';
import { finalize } from 'rxjs';
import { Loading } from 'components/Loading';
import styled from 'styled-components'


const Container = styled(Loading)`
.ant-checkbox-wrapper {
  margin-inline-start: 0 !important;
}
`;

const { Paragraph, Text } = Typography;

const reasons = [
  'Not useful as expected',
  'Too many bugs',
  'Poor user experience',
  'Too expensive',
  'Poor customer support',
  'Other reason'
];

const SurveyPanel = props => {
  const { onCancel, onOk, onSetLoading } = props;
  const [loading, setLoading] = React.useState(false);
  const [user, setAuthUser] = useAuthUser();

  React.useEffect(() => {
    onSetLoading(loading);
  }, [loading]);

  const handleSubmit = (values) => {
    setLoading(true);
    terminateOrg$(values).pipe(
      finalize(() => setLoading(false))
    ).subscribe(() => {
      onOk();
      setAuthUser(null, '/');
    })
  }



  return <Container loading={loading}>
    <Form
      layout="vertical"
      requiredMark={false}
      onFinish={handleSubmit}
    >
      <Paragraph type="secondary">
        If you have any feedback or suggestions about how we can improve our services, please do not hesitate to let us know. We value your opinion and will take your feedback into consideration as we continue to develop and enhance our platform.
      </Paragraph>
      <Form.Item name="reasons" rules={[{ required: true, type: 'array' }]}>
        <Checkbox.Group name="checked">
          <Row gutter={[8, 8]}>
            {reasons.map((r, i) => <Col key={i} span={24}>
              <Checkbox value={r}>{r}</Checkbox>
            </Col>)}
          </Row>
        </Checkbox.Group>
      </Form.Item>
      <Form.Item name="feedback" rules={[{ max: 1000 }]}>
        <Input.TextArea placeholder='Tell us your feedback' allowClear autoSize={{ minRows: 5 }} />
      </Form.Item>
      <Form.Item>
        <Space style={{ width: '100%', justifyContent: 'end' }}>
          <Button type="text" onClick={onCancel}>Cancel</Button>
          <Button type="primary" danger htmlType="submit">Terminate Subscription</Button>
        </Space>
      </Form.Item>
    </Form>
  </Container>
}

export const useTerminateModal = () => {
  const [confirmModal, confirmContextHolder] = Modal.useModal();
  const [surveyModal, surveyContextHolder] = Modal.useModal();

  const openSurveyModal = () => {
    const surveyModalInstance = surveyModal.confirm({
      icon: <InfoCircleFilled style={{ color: '#F53F3F' }} />,
      title: <>Reasons to leave ZeeWorkflow</>,
      maskClosable: false,
      closable: true,
      destroyOnClose: true,
      focusTriggerAfterClose: false,
      footer: null,
      content: <SurveyPanel
        onOk={() => surveyModalInstance.destroy()}
        onCancel={() => surveyModalInstance.destroy()}
        onSetLoading={loading => surveyModalInstance.update({ closable: !loading })}
      />
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
