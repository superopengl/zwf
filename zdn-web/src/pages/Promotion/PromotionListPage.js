import React from 'react';
import styled from 'styled-components';
import { Typography, Button, Table, Input, Modal, Form, Tooltip, Tag, Drawer, Radio, InputNumber } from 'antd';
import {
  DeleteOutlined, SafetyCertificateOutlined, UserAddOutlined, GoogleOutlined, SyncOutlined, QuestionOutlined,
  SearchOutlined,
  UserOutlined,
  ClearOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space, Pagination } from 'antd';
import { listPromotions$, savePromotion$, newPromotionCode$ } from 'services/promotionService';
import { inviteUser$, impersonate$ } from 'services/authService';
import { TimeAgo } from 'components/TimeAgo';
import { FaTheaterMasks } from 'react-icons/fa';
import { reactLocalStorage } from 'reactjs-localstorage';
import { GlobalContext } from 'contexts/GlobalContext';
import ProfileForm from 'pages/Profile/ProfileForm';
import HighlightingText from 'components/HighlightingText';
import CheckboxButton from 'components/CheckboxButton';
import TagSelect from 'components/TagSelect';
import { listUserTags, saveUserTag } from 'services/userTagService';
import ReactDOM from 'react-dom';
import TagFilter from 'components/TagFilter';
import { listOrgs$ } from 'services/orgService';
import { DatePicker } from 'antd';


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

const LOCAL_STORAGE_KEY = 'user_query';

const PromotionListPage = () => {

  const [profileModalVisible, setProfileModalVisible] = React.useState(false);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [setPasswordVisible, setSetPasswordVisible] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [list, setList] = React.useState([]);
  const [tags, setTags] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [newCode, setNewCode] = React.useState();
  const context = React.useContext(GlobalContext);
  const [queryInfo, setQueryInfo] = React.useState(reactLocalStorage.getObject(LOCAL_STORAGE_KEY, DEFAULT_QUERY_INFO, true))


  const columnDef = [
    {
      title: 'Code',
      dataIndex: 'code',
      fixed: 'left',
      render: (value) => value,
    },
    {
      title: '%',
      dataIndex: 'percentage',
      render: (value) => <>{value * 100} %</>,
    },
    {
      title: 'End',
      dataIndex: 'end',
      render: (value) => <TimeAgo value={value} />
    },
    {
      title: 'Org',
      dataIndex: 'orgName',
      render: (value) => value
    },
    {
      title: 'Seats',
      dataIndex: 'seats',
      render: (value) => value
    },
    {
      title: 'Subscription',
      dataIndex: 'type',
      render: (value, item) => value
    },
  ];

  const loadList = () => {
    setLoading(true);

    return listPromotions$().subscribe(
      list => setList(list),
    ).add(() => {
      setLoading(false);
    });
  }

  React.useEffect(() => {
    const load$ = loadList();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  const updateQueryInfo = (queryInfo) => {
    reactLocalStorage.setObject(LOCAL_STORAGE_KEY, queryInfo);
    setQueryInfo(queryInfo);
  }

  const handleSearchTextChange = text => {
    const newQueryInfo = {
      ...queryInfo,
      text
    }
    updateQueryInfo(newQueryInfo);
    // await loadTaskWithQuery(newQueryInfo);
  }

  const handleSearch = async (value) => {
    const text = value?.trim();

    const newQueryInfo = {
      ...queryInfo,
      text
    }

    await loadList(newQueryInfo);
  }

  const handleNewPromotionCode = () => {
    newPromotionCode$().subscribe(code => {
      setNewCode(code);
      setModalVisible(true);
    })
  }

  const handleSavePromotion = async values => {
    savePromotion$(values).subscribe(() => {
      setModalVisible(false);
      loadList();
    });
  }

  return (
    <ContainerStyled>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button type="primary" onClick={() => handleNewPromotionCode()} icon={<PlusOutlined />}>New Promotion Code</Button>
          <Button type="primary" ghost onClick={() => loadList()} icon={<SyncOutlined />}></Button>
        </Space>
        <Table columns={columnDef}
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          rowKey="id"
          loading={loading}
          style={{ marginTop: 20 }}
        />
      </Space>
      <Modal
        visible={modalVisible}
        destroyOnClose={true}
        maskClosable={false}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        title={<>New Promotion Code</>}
        footer={null}
        width={300}
      >
        <Form layout="horizontal" onFinish={handleSavePromotion}
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          initialValues={{ code: newCode, percentage: 0.9 }}>
          <Form.Item label="Code" name="code" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <Input readOnly={true} />
          </Form.Item>
          <Form.Item label="Percentage" name="percentage" rules={[{ required: true, type: 'number', min: 0.01, max: 0.99, whitespace: true }]}>
            <InputNumber
              min={0.01}
              max={0.99}
              step={0.01}
              formatter={value => `${value * 100} %`}
              parser={value => +(value.replace(' %', '')) / 100}
            />
          </Form.Item>
          <Form.Item label="End" name="end" rules={[{ required: true, type: 'date', whitespace: true, message: ' ' }]}>
            <DatePicker type="date" />
          </Form.Item>
          <Form.Item wrapperCol={{span: 24}}>
            <Button block type="primary" htmlType="submit" disabled={loading}>Create</Button>
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
    </ContainerStyled>

  );
};

PromotionListPage.propTypes = {};

PromotionListPage.defaultProps = {};

export default withRouter(PromotionListPage);
