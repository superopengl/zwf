import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Table, Input, Modal, Form, Tooltip, Tag } from 'antd';

import {
  DeleteOutlined, SafetyCertificateOutlined, UserAddOutlined, GoogleOutlined, SyncOutlined, QuestionOutlined,
  IdcardOutlined,
  UserOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space, Alert } from 'antd';
import { listAllUsers, deleteUser, setPasswordForUser } from 'services/userService';
import { inviteUser, impersonate } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { FaTheaterMasks } from 'react-icons/fa';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import PortfolioList from 'pages/Portfolio/PortfolioList';
import ProfileForm from 'pages/Profile/ProfileForm';

const { Title, Text, Paragraph } = Typography;

const ContainerStyled = styled.div`
  margin: 6rem 1rem 2rem 1rem;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled(Layout)`
  margin: 0 auto 0 auto;
  background-color: #ffffff;
  height: 100%;
`;



const UserListPage = () => {

  const [] = React.useState(false);
  const [] = React.useState(false);
  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [portfolioModalVisible, setPortfolioModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [inviteVisible, setInviteVisible] = React.useState(false);
  const context = React.useContext(GlobalContext);

  const columnDef = [
    {
      title: 'Email',
      dataIndex: 'email',
      render: (text) => text,
    },
    {
      title: 'Given Name',
      dataIndex: 'givenName',
      render: (text) => text,
    },
    {
      title: 'Surname',
      dataIndex: 'surname',
      render: (text) => text,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (text) => text
    },
    {
      title: 'Login Type',
      dataIndex: 'loginType',
      render: (text) => text === 'local' ? <Tag color="#333333">Local</Tag> : <Tag icon={<GoogleOutlined />} color="#183e91">Google</Tag>
    },
    {
      title: 'Last Logged In At',
      dataIndex: 'lastLoggedInAt',
      render: (text) => <TimeAgo value={text} />,
    },
    {
      title: 'Last Action At',
      dataIndex: 'lastNudgedAt',
      render: (text) => <TimeAgo value={text} />,
    },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, user) => {
        return (
          <Space size="small" style={{ width: '100%' }}>
            <Tooltip placement="bottom" title="Update profile">
              <Button type="link" icon={<UserOutlined />} onClick={e => openProfileModal(e, user)} />
            </Tooltip>
            <Tooltip placement="bottom" title="Set password">
              <Button type="link" icon={<SafetyCertificateOutlined />} onClick={e => openSetPasswordModal(e, user)} />
            </Tooltip>
            <Tooltip placement="bottom" title="Impersonate">
              <Button type="link" onClick={e => handleImpersonante(e, user)} disabled={context.user.profile.email === user.profile.email}>
                <FaTheaterMasks style={{ position: 'relative', top: 1 }} size={20} />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Portfolio">
              <Button type="link" onClick={e => handlePortfolioForUser(e, user)} disabled={user.role !== 'client'}>
                <IdcardOutlined style={{ position: 'relative', top: 1 }} size={20} />
              </Button>
            </Tooltip>
            <Tooltip placement="bottom" title="Delete user">
              <Button type="link" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, user)} disabled={user.profile.email === 'admin@filedin.io'} />
            </Tooltip>
          </Space>
        )
      },
    },
  ];

  const loadList = async () => {
    setLoading(true);
    const list = await listAllUsers();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, email } = item;
    Modal.confirm({
      title: <>Delete user <strong>{email}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteUser(id);
        await loadList();
        setLoading(false);
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const handleImpersonante = async (e, item) => {
    e.stopPropagation();
    // setSetPasswordVisible(true);
    // setCurrentUser(item);
    Modal.confirm({
      title: 'Impersonate',
      icon: <QuestionOutlined />,
      content: <>To impersonate user <Text code>{item.email}</Text></>,
      okText: 'Yes, impersonate',
      maskClosable: true,
      onOk: async () => {
        await impersonate(item.email);
        reactLocalStorage.clear();
        window.location = '/';
      }
    })
  }

  const handlePortfolioForUser = async (e, user) => {
    e.stopPropagation();
    setCurrentUser(user);
    setPortfolioModalVisible(true);
  }

  const openSetPasswordModal = async (e, user) => {
    e.stopPropagation();
    setSetPasswordVisible(true);
    setCurrentUser(user);
  }

  const openProfileModal = async (e, user) => {
    e.stopPropagation();
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
    await inviteUser(email);
    setInviteVisible(false);
    loadList();
  }


  return (
    <LayoutStyled>
      
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>User Management</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost onClick={() => handleNewUser()} icon={<UserAddOutlined />}>Invite User</Button>
            <Button type="primary" ghost onClick={() => loadList()} icon={<SyncOutlined />}>Refresh</Button>
          </Space>
          <Table columns={columnDef}
            dataSource={list}
            size="small"

            // scroll={{x: 1000}}
            rowKey="id"
            loading={loading}
            pagination={false}
          // pagination={queryInfo}
          // onChange={handleTableChange}
          // onRow={(record, index) => ({
          //   onDoubleClick: e => {
          //     setCurrentId(record.id);
          //     setFormVisible(true);
          //   }
          // })}
          />
        </Space>
      </ContainerStyled>
      <Modal
        visible={setPasswordVisible}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setSetPasswordVisible(false)}
        onCancel={() => setSetPasswordVisible(false)}
        title={<>Reset Password</>}
        footer={null}
        width={400}
      >
        <Form layout="vertical" onFinish={values => handleSetPassword(currentUser?.id, values)}>
          <Space style={{ justifyContent: 'center', width: '100%' }}>
            <Paragraph code>{currentUser?.email}</Paragraph>
          </Space>
          <Form.Item label="Password" name="password" rules={[{ required: true, message: ' ' }]}>
            <Input placeholder="New password" autoComplete="new-password" disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Reset Password</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={inviteVisible}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setInviteVisible(false)}
        onCancel={() => setInviteVisible(false)}
        title={<>Invite User</>}
        footer={null}
        width={500}
      >
        <Paragraph>System will send an invitation to the email address if the email address hasn't signed up before.</Paragraph>
        <Form layout="vertical" onFinish={handleInviteUser}>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', whitespace: true, max: 100, message: ' ' }]}>
            <Input placeholder="abc@xyz.com" type="email" autoComplete="email" allowClear={true} maxLength="100" autoFocus={true} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Invite</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={portfolioModalVisible}
        destroyOnClose={true}
        maskClosable={false}
        closable={true}
        onOk={() => setPortfolioModalVisible(false)}
        onCancel={() => setPortfolioModalVisible(false)}
        title={<>Portoflios for <Text code>{currentUser?.email}</Text></>}
        footer={null}
        width={600}
      >
        {currentUser && <PortfolioList userId={currentUser.id} />}
      </Modal>
      <Modal
        visible={profileModalVisible}
        destroyOnClose={true}
        maskClosable={false}
        title="Update Profile"
        onOk={() => setProfileModalVisible(false)}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
      >
        <Alert style={{ marginBottom: '0.5rem' }} type="warning" message="Changing email will change the login account. After changing, system will send out a new invitation to the new email address to reset your password." />

        {currentUser && <ProfileForm user={currentUser} onOk={() => setProfileModalVisible(false)} />}
      </Modal>
    </LayoutStyled >

  );
};

UserListPage.propTypes = {};

UserListPage.defaultProps = {};

export default withRouter(UserListPage);
