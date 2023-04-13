import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Table, Input, Form, Tooltip, Tag, Drawer } from 'antd';

import {
  EditOutlined, PlusOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';
import * as _ from 'lodash';
import { listEmailTemplate, saveEmailTemplate } from 'services/emailTemplateService';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const { Title } = Typography;

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

  .ant-drawer-content {
    .ql-editor {
      height: 300px !important;
    } 
  }
`;

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline','strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image'
];

const EmailTemplateListPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState();
  const [list, setList] = React.useState([]);

  const columnDef = [
    {
      title: 'Key',
      dataIndex: 'key',
      sorter: {
        compare: (a, b) => a.key.localeCompare(b.keyy)
      },
      render: (text) => text,
    },
    {
      title: 'Locale',
      dataIndex: 'locale',
      sorter: {
        compare: (a, b) => a.locale.localeCompare(b.locale)
      },
      render: (text) => {
        switch (text) {
          case 'zh-CN':
            return '简体中文';
          case 'zh-TW':
            return '繁體中文';
          case 'en-US':
          default:
            return 'English';
        }
      },
    },
    {
      title: 'Template',
      render: (text, item) => {
        return <Space direction="vertical" style={{ width: '100%' }}>
          <Input value={item.subject} readOnly />
          <ReactQuill value={item.body} readOnly modules={{toolbar:false}}/>
        </Space>
      },
    },
    {
      title: 'Variables',
      dataIndex: 'vars',
      render: (vars) => {
        return <Space direction="vertical" style={{ width: '100%' }} size="small">
          {vars?.map((v, i) => <Tag key={i}>{v}</Tag>)}
        </Space>
      },
    },
    {
      render: (text, item) => {
        return (
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Tooltip placement="bottom" title="Edit">
              <Button shape="circle" icon={<EditOutlined />}
                onClick={() => handleEdit(item)} />
            </Tooltip>
          </Space>
        )
      },
    },
  ];

  const handleEdit = item => {
    setCurrentItem(item);
    setDrawerVisible(true);
  }

  const handleCreateNew = () => {
    setCurrentItem(undefined);
    setDrawerVisible(true);
  }


  const loadList = async () => {
    try {
      setLoading(true);
      setList(await listEmailTemplate());
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
  }, []);

  const handleSaveNew = async (values) => {
    try {
      setLoading(true);
      const {locale, key, ...payload} = values;
      await saveEmailTemplate(locale, key, payload);
      setDrawerVisible(false);
      await loadList();
    } finally {
      setLoading(false);

    }
  }


  return (
    <LayoutStyled>
      
      <ContainerStyled>
        <Space direction="vertical" style={{ width: '100%' }}>
          <StyledTitleRow>
            <Title level={2} style={{ margin: 'auto' }}>Email Template</Title>
          </StyledTitleRow>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button type="primary" ghost onClick={() => handleCreateNew()} icon={<PlusOutlined />} />
          </Space>
          <Table columns={columnDef}
            dataSource={list}
            size="small"
            rowKey={item => `${item.key}.${item.locale}`}
            loading={loading}
            pagination={false}
          />
        </Space>
      </ContainerStyled>
      <Drawer
        // title=" "
        id="scrolling-container"
        visible={drawerVisible}
        closable={true}
        maskClosable={true}
        onClose={() => setDrawerVisible(false)}
        width={600}
        destroyOnClose={true}
      >
        <Form
          layout="vertical"
          onFinish={handleSaveNew}
          initialValues={{...currentItem, body: currentItem?.body || ''}}
        >
          <Form.Item label="Key" name="key" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <Input allowClear autoFocus disabled={currentItem}/>
          </Form.Item>
          {/* <Form.Item label="Locale" name="locale" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <LocaleSelector disabled={currentItem} />
          </Form.Item> */}
          <Form.Item label="Subject" name="subject" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <Input allowClear />
          </Form.Item>
          <Form.Item label="Body" name="body" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <ReactQuill scrollingContainer="#scrolling-container" modules={modules} formats={formats}/>
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit">Save</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </LayoutStyled >

  );
};

EmailTemplateListPage.propTypes = {};

EmailTemplateListPage.defaultProps = {};

export default withRouter(EmailTemplateListPage);
