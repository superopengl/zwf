import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Form, Tag, Drawer, Select, PageHeader } from 'antd';
import {
  UserAddOutlined, GoogleOutlined, SyncOutlined, QuestionOutlined,
  SearchOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';
import { deleteUser, setPasswordForUser, setUserRole } from 'services/userService';
import { inviteUser$, impersonate$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import ReactDOM from 'react-dom';
import DropdownMenu from 'components/DropdownMenu';
import { UserNameLabel } from 'components/UserNameLabel';
import loadable from '@loadable/component'
import { getMyCurrentSubscription, getMyCurrentSubscription$ } from 'services/subscriptionService';
import useLocalStorageState from 'use-local-storage-state'
import { TagSelect } from 'components/TagSelect';
import { listOrgMembers$ } from 'services/orgService';
import { combineLatest } from 'rxjs';
import { finalize } from 'rxjs/operators';

const PaymentStepperWidget = loadable(() => import('components/checkout/PaymentStepperWidget'));

const { Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
`;

const DEFAULT_QUERY_INFO = {
  text: '',
  tags: [],
  page: 1,
  size: 50,
  orderField: 'createdAt',
  orderDirection: 'DESC'
};

const LOCAL_STORAGE_KEY = 'agent_list_query';

const AgentUserListPage = () => {

  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [subscription, setSubscription] = React.useState();
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [inviteVisible, setInviteVisible] = React.useState(false);

  const columnDef = [
    {
      // title: 'User',
      fixed: 'left',
      render: (text, item) => <UserNameLabel userId={item.id} profile={item} />,
    },
    {
      // title: 'Role',
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
      title: 'Login Type',
      dataIndex: 'loginType',
      render: (text) => text === 'local' ? <Tag color="#333333">Local</Tag> : <Tag icon={<GoogleOutlined />} color="#4c8bf5">Google</Tag>
    },
    // {
    //   title: 'Tags',
    //   dataIndex: 'tags',
    //   render: (value, item) => <TagSelect tags={tags} onSave={saveUserTag} value={value} onChange={tags => handleTagChange(item, tags)} />
    // },
    {
      title: 'Last Activity',
      dataIndex: 'lastNudgedAt',
      render: (text) => <TimeAgo value={text} showTime={false} />,
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   render: (text) => text,
    // },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      align: 'right',
      fixed: 'right',
      render: (text, user) => {
        return (
          <DropdownMenu
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
                onClick: () => openSetPasswordModal(user)
              },
              {
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

  const loadList = () => {
    setLoading(true);
    return combineLatest([listOrgMembers$(), getMyCurrentSubscription$()]).pipe(
      finalize(() => setLoading(false))
    ).subscribe(([members, subscription]) => {
      setList(members);
      setSubscription(subscription);
    })
  }

  React.useEffect(() => {
    const sub = loadList();
    return () => sub.unsubscribe();
  }, []);


  const handleDelete = async (item) => {
    const { id } = item;
    Modal.confirm({
      title: <>Delete user</>,
      content: <UserNameLabel userId={item.id} profile={item} />,
      onOk: async () => {
        await deleteUser(id);
        loadList();
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const handleImpersonante = async (item) => {
    // setSetPasswordVisible(true);
    // setCurrentUser(item);
    Modal.confirm({
      title: 'Impersonate',
      icon: <QuestionOutlined />,
      content: <UserNameLabel userId={item.id} profile={item} />,
      okText: 'Yes, impersonate',
      maskClosable: true,
      onOk: () => {
        impersonate$(item.email)
          .subscribe(() => {
            reactLocalStorage.clear();
            window.location = '/';
          });
      }
    })
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
    const { email } = values;
    inviteUser$(email).subscribe(() => {
      setInviteVisible(false);
      loadList();
    });
  }

  const handleBuyLicense = () => {
    setModalVisible(true);
  }

  const handlePaymentOk = async () => {
    setModalVisible(false);
    await loadList();
  }

  const handleCancelPayment = () => {
    setModalVisible(false);
  }

  const handleUserRoleChange = async (item, role) => {
    if (role && role !== item.role) {
      await setUserRole(item.id, role);
      loadList();
    }
  }

  return (
    <ContainerStyled>
      <PageHeader
        backIcon={false}
        title={"Team & Member Accounts"}
        extra={[
          subscription ? <span key="buy-more">{subscription.seats - subscription.occupiedSeats} licenses left - <Button type="link" onClick={() => handleBuyLicense()} style={{ paddingLeft: 0 }}>Buy more</Button></span> : null,
          <Button
            key="add"
            type="primary"
            ghost
            onClick={() => handleNewUser()}
            icon={<UserAddOutlined />}
            disabled={!subscription || subscription.occupiedSeats >= subscription.seats}>
            Add Member
          </Button>
        ].filter(x => !!x)}
      >
        <Table columns={columnDef}
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          // scroll={{x: 1000}}
          rowKey="id"
          loading={loading}
          style={{ marginTop: 20 }}
          pagination={false}
        />

      </PageHeader>

      <Modal
        visible={setPasswordVisible}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setSetPasswordVisible(false)}
        onCancel={() => setSetPasswordVisible(false)}
        title={<>Set Password</>}
        footer={null}
        width={400}
      >
        <Form layout="vertical" onFinish={values => handleSetPassword(currentUser?.id, values)}>
          <div style={{ marginBottom: 20 }}>
            {currentUser && <UserNameLabel userId={currentUser.id} profile={currentUser} />}
          </div>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: ' ' }]}>
            <Input placeholder="New password" autoFocus autoComplete="new-password" disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Set Password</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={inviteVisible}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setInviteVisible(false)}
        onCancel={() => setInviteVisible(false)}
        title={<>Invite Member</>}
        footer={null}
        width={500}
      >
        <Paragraph>System will send an invitation to the email address if the email address hasn't signed up before.</Paragraph>
        <Form layout="vertical" onFinish={handleInviteUser}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
            <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
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
            <Button block type="primary" htmlType="submit" disabled={loading}>Invite</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Drawer
        visible={profileModalVisible}
        destroyOnClose={true}
        maskClosable={true}
        title="Update Profile"
        onClose={() => setProfileModalVisible(false)}
        footer={null}
        width={400}
      >
        {/* <Alert style={{ marginBottom: '0.5rem' }} type="warning" showIcon message="Changing email will change the login account. After changing, system will send out a new invitation to the new email address to reset your password." /> */}

        {currentUser && <ProfileForm user={currentUser} onOk={() => setProfileModalVisible(false)} refreshAfterLocaleChange={false} />}
      </Drawer>
      <Modal
        visible={modalVisible}
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
    </ContainerStyled>

  );
};

AgentUserListPage.propTypes = {};

AgentUserListPage.defaultProps = {};

export default withRouter(AgentUserListPage);
