import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Form, Drawer, Select, Row } from 'antd';
import Icon, {
  UserAddOutlined, QuestionOutlined, SyncOutlined, QuestionCircleOutlined
} from '@ant-design/icons';
import { deleteUser$, setPasswordForUser, setUserRole } from 'services/userService';
import { inviteMember$, impersonate$, reinviteMember$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import ProfileForm from 'pages/Profile/ProfileForm';
import DropdownMenu from 'components/DropdownMenu';
import loadable from '@loadable/component'
import { listOrgMembers$ } from 'services/memberService';
import { finalize } from 'rxjs/operators';
import { UserNameCard } from 'components/UserNameCard';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { Loading } from 'components/Loading';
import { useAssertRole } from 'hooks/useAssertRole';
import { useAuthUser } from 'hooks/useAuthUser';
import { MdGroupAdd } from 'react-icons/md';

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
  const [user, setAuthUser] = useAuthUser();
  const [modal, contextHolder] = Modal.useModal();

  const showRoleHelp = () => {
    modal.info({
      title: 'About roles',
      content: <>
        <Paragraph>
          <Text code>owner</Text> The superuser of the organization, as well as the user who registered this organization in ZeeWorkflow, has the same level of access to features as the <Text code>admin</Text> role.
        </Paragraph>
        <Paragraph>
          <Text code>admin</Text> This user can access all the features related to tasks, scheduler, templates, users, and tags. Moreover, they have the ability to manage team members and subscriptions, which includes handling billing, invoices, and payment methods.
        </Paragraph>
        <Paragraph>
          <Text code>member</Text> This user can access all the features related to tasks, scheduler, templates, users, and tags in the same manner as the <Text code>admin</Text> role.
        </Paragraph>
      </>,
      closable: true,
    })
  }

  const columnDef = [
    {
      title: 'Member',
      fixed: 'left',
      render: (text, item) => <UserNameCard userId={item.id} />,
    },
    {
      title: <>Role <QuestionCircleOutlined onClick={showRoleHelp} /></>,
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
      render: (text, item) => {
        const isMe = item.id === user.id;
        return (
          <DropdownMenu
            disabled={isMe}
            config={[
              {
                menu: 'Update profile',
                onClick: () => openProfileModal(item)
              },
              item.loginType === 'local' ? {
                menu: 'Set password',
                onClick: () => openSetPasswordModal(item)
              } : null,
              // {
              //   menu: 'Impersonate',
              //   onClick: () => handleImpersonante(item)
              // },
              {
                menu: 'Resend invite',
                onClick: () => handleResendInvite(item)
              },
              item.orgOwner ? null : {
                menu: <Text type="danger">Delete user</Text>,
                onClick: () => handleDelete(item),
                disabled: item.orgOwner
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
        impersonate$(item.id)
          .subscribe(impersonatedUser => {
            setAuthUser(impersonatedUser, '/landing');
            // reactLocalStorage.clear();
            // window.location = '/';
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

  const handleMemberProfileUpdate = (updatedUser) => {
    setList(pre => pre.map(u => u.id === updatedUser.id ? updatedUser : u));
    setProfileModalVisible(false)
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
          icon={<Icon component={MdGroupAdd} />}>
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
        <Loading loading={loading} >
          <Form layout="vertical"
            onFinish={handleInviteUser}
            requiredMark={false}
          >
            <Form.Item label=""
              extra='Multiple email addresses can be splitted by comma or line-break'
              name="emails" rules={[{ required: true, whitespace: true, max: 1000 }]}>
              <Input.TextArea placeholder={`andy@zeeworkflow.com\nbob@zeeworkflow.com`}
                autoSize={{ minRows: 5 }}
                autoComplete="email"
                allowClear={true}
                maxLength="1000"
                autoFocus={true}
                disabled={loading} />
            </Form.Item>
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

        {currentUser && <ProfileForm user={currentUser} onOk={handleMemberProfileUpdate} refreshAfterLocaleChange={false} />}
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
