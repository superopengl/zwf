import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Form, Drawer, Select, Row } from 'antd';
import {
  UserAddOutlined, QuestionOutlined, SyncOutlined
} from '@ant-design/icons';
import { deleteUser$, setPasswordForUser, setUserRole } from 'services/userService';
import { inviteMember$, impersonate$, reinviteMember$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { reactLocalStorage } from 'reactjs-localstorage';
import ProfileForm from 'pages/Profile/ProfileForm';
import DropdownMenu from 'components/DropdownMenu';
import loadable from '@loadable/component'
import { listOrgMembers$ } from 'services/memberService';
import { finalize } from 'rxjs/operators';
import { UserNameCard } from 'components/UserNameCard';
import { GlobalContext } from 'contexts/GlobalContext';
import { PageContainer } from '@ant-design/pro-components';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { Loading } from 'components/Loading';
import { useAssertRole } from 'hooks/useAssertRole';

const PaymentStepperWidget = loadable(() => import('components/checkout/PaymentStepperWidget'));

const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
`;

const OrgMemberListPage = () => {

  useAssertRole(['admin', 'agent']);
  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [inviteVisible, setInviteVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);
  const [modal, contextHolder] = Modal.useModal();

  const columnDef = [
    {
      title: 'Member',
      fixed: 'left',
      render: (text, item) => <UserNameCard userId={item.id} />,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (value, item) => <Select bordered={false}
        disabled={item.orgOwner}
        // suffixIcon={<CaretDownOutlined/>}
        value={value}
        onChange={role => handleUserRoleChange(item, role)}
        style={{ width: 100 }}
        options={item.orgOwner ? [
          { label: 'owner', value: 'admin' },
        ] : [
          { label: 'member', value: 'agent' },
          { label: 'admin', value: 'admin' },
        ]} />
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastNudgedAt',
      render: (text) => <TimeAgo value={text} showTime={false} />,
    },
    {
      align: 'right',
      fixed: 'right',
      render: (text, user) => {
        const isMe = user.id === context.user.id;
        return (
          <DropdownMenu
            disabled={isMe}
            config={[
              {
                menu: 'Update profile',
                onClick: () => openProfileModal(user)
              },
              user.loginType === 'local' ? {
                menu: 'Set password',
                onClick: () => openSetPasswordModal(user)
              } : null,
              {
                menu: 'Impersonate',
                onClick: () => handleImpersonante(user)
              },
              {
                menu: 'Resend invite',
                onClick: () => handleResendInvite(user)
              },
              user.orgOwner ? null : {
                menu: <Text type="danger">Delete user</Text>,
                onClick: () => handleDelete(user),
                disabled: user.orgOwner
              },
            ].filter(x => !!x)}
          />
        )
      },
    },
  ].filter(x => !!x);

  const loadList$ = () => {
    setLoading(true);
    return listOrgMembers$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(members => {
      setList(members);
    })
  }

  React.useEffect(() => {
    const sub = loadList$();
    return () => sub.unsubscribe();
  }, []);

  const handleDelete = async (item) => {
    const { id } = item;
    modal.confirm({
      title: <>Delete user</>,
      content: <UserNameCard userId={item.id} />,
      onOk: () => {
        deleteUser$(id).subscribe(() => loadList$());
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!',
      cancelButtonProps: {
        type: 'text'
      },
      autoFocusButton: 'cancel',
    });
  }

  const handleImpersonante = (item) => {
    // setSetPasswordVisible(true);
    // setCurrentUser(item);
    modal.confirm({
      title: 'Impersonate',
      icon: <QuestionOutlined />,
      content: <UserNameCard userId={item.id} />,
      okText: 'Yes, impersonate',
      maskClosable: true,
      onOk: () => {
        impersonate$(item.email)
          .subscribe(() => {
            reactLocalStorage.clear();
            window.location = '/';
          });
      },
      cancelButtonProps: {
        type: 'text'
      },
    })
  }

  const handleResendInvite = (item) => {
    reinviteMember$(item.email, true).subscribe(() => {
      modal.success({
        title: 'Resent invite',
        content: <>Has resent an invite email to email <Text code>{item.email}</Text></>
      });
    });
  }


  const openSetPasswordModal = async (user) => {
    setSetPasswordVisible(true);
    setCurrentUser(user);
  }

  const openProfileModal = async (user) => {
    setProfileModalVisible(true);
    setCurrentUser(user);
  }

  const handleSetPassword = async (id, values) => {
    setLoading(true);
    await setPasswordForUser(id, values.password);
    setSetPasswordVisible(false);
    setCurrentUser(undefined);
    setLoading(false);
  }

  const handleNewUser = () => {
    setInviteVisible(true);
  }

  const handleInviteUser = async values => {
    const { emails } = values;
    setLoading(true);
    inviteMember$(emails).pipe(
      finalize(() => setLoading(false))
    ).subscribe(() => {
      setInviteVisible(false);
      loadList$();
    });
  }

  const handlePaymentOk = async () => {
    setModalVisible(false);
    await loadList$();
  }

  const handleCancelPayment = () => {
    setModalVisible(false);
  }

  const handleUserRoleChange = async (item, role) => {
    if (role && role !== item.role) {
      await setUserRole(item.id, role);
      loadList$();
    }
  }

  return (
    <ContainerStyled>
      <PageHeaderContainer
        breadcrumb={[
          {
            name: 'Users'
          },
          {
            name: 'Team',
          },
        ]}
        loading={loading}
        title="Team Members"
        extra={[<Button
          key="refresh"
          onClick={() => loadList$()}
          icon={<SyncOutlined />}>
        </Button>,
        <Button
          key="add"
          type="primary"
          ghost
          onClick={() => handleNewUser()}
          icon={<UserAddOutlined />}>
          Add Member
        </Button>
        ]}
      >
        <Table columns={columnDef}
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          rowKey="id"
          style={{ marginTop: 20 }}
          pagination={false}
        />

      </PageHeaderContainer>

      <Modal
        open={setPasswordVisible}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setSetPasswordVisible(false)}
        onCancel={() => setSetPasswordVisible(false)}
        title={<>Activate Account</>}
        footer={null}
        width={400}
      >
        <Form layout="vertical" onFinish={values => handleSetPassword(currentUser?.id, values)}>
          <div style={{ marginBottom: 20 }}>
            {currentUser && <UserNameCard userId={currentUser.id} />}
          </div>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: ' ' }]}>
            <Input placeholder="New password" autoFocus autoComplete="new-password" disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Activate Account</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={inviteVisible}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setInviteVisible(false)}
        onCancel={() => setInviteVisible(false)}
        title={<>Add Members</>}
        footer={null}
      // width={500}
      >
        <Paragraph>System will send an invitation to the email address if the email address hasn't signed up before.</Paragraph>
        {/* <Paragraph>Multiple email addresses can be splitted by comma, like "andy@zeeworkflow.com, bob@zeeworkflow.com"</Paragraph> */}
        <Loading loading={loading} >
          <Form layout="vertical"
            onFinish={handleInviteUser}
            requiredMark={false}
          >
            <Form.Item label=""
              extra='Multiple email addresses can be splitted by comma, like "andy@zeeworkflow.com, bob@zeeworkflow.com"'
              name="emails" rules={[{ required: true, whitespace: true, max: 1000 }]}>
              <Input.TextArea placeholder="andy@zeeworkflow.com, bob@zeeworkflow.com"
                autoSize={{ minRows: 3 }}
                autoComplete="email"
                allowClear={true}
                maxLength="1000"
                autoFocus={true}
                disabled={loading} />
            </Form.Item>
            {/* <Form.Item label="Role" name="role" help="Admin can define task template, doc template, and see subscription, payment and agent metrics information.">
            <Radio.Group defaultValue="agent" disabled={loading} optionType="button" buttonStyle="solid">act
              <Radio.Button value="admin">Admin</Radio.Button>
              <Radio.Button value="agent">Agent</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Tags" name="tags">
            <TagSelect tags={tags} onSave={saveUserTag} />
          </Form.Item> */}
            <Form.Item>
              <Row justify="end">
                <Button type="primary" htmlType="submit" disabled={loading}>Invite</Button>

              </Row>
            </Form.Item>
          </Form>
        </Loading>
      </Modal>
      <Drawer
        open={profileModalVisible}
        destroyOnClose={true}
        maskClosable={true}
        title="User Profile"
        onClose={() => setProfileModalVisible(false)}
        footer={null}
        width={400}
      >
        {/* <Alert style={{ marginBottom: '0.5rem' }} type="warning" showIcon message="Changing email will change the login account. After changing, system will send out a new invitation to the new email address to reset your password." /> */}

        {currentUser && <ProfileForm user={currentUser} onOk={() => setProfileModalVisible(false)} refreshAfterLocaleChange={false} />}
      </Drawer>
      <Modal
        open={modalVisible}
        closable={!paymentLoading}
        maskClosable={false}
        title="Buy licenses"
        destroyOnClose
        footer={null}
        width={420}
        onOk={handleCancelPayment}
        onCancel={handleCancelPayment}
      >
        <PaymentStepperWidget
          onComplete={handlePaymentOk}
          onLoading={loading => setPaymentLoading(loading)}
        />
      </Modal>
      {contextHolder}
    </ContainerStyled>

  );
};

OrgMemberListPage.propTypes = {};

OrgMemberListPage.defaultProps = {};

export default OrgMemberListPage;
