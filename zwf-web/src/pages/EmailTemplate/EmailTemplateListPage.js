import React from 'react';
import styled from 'styled-components';
import { Typography, Card, Button, Input, Form, Tooltip, Drawer, Row, Col, Tag, List } from 'antd';
import {
  EditOutlined
} from '@ant-design/icons';
import { withRouter } from 'react-router-dom';
import { Space } from 'antd';
import { listEmailTemplate, saveEmailTemplate } from 'services/emailTemplateService';
import { LocaleSelector } from 'components/LocaleSelector';
import { from } from 'rxjs';
import { Switch } from 'antd';
import {RickTextInput} from 'components/RichTextInput';
import {RawHtmlDisplay} from 'components/RawHtmlDisplay';

const { Text } = Typography;

const ContainerStyled = styled.div`
  width: 100%;
`;


const EmailTemplateListPage = () => {

  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentItem, setCurrentItem] = React.useState();
  const [list, setList] = React.useState([]);

  const handleEdit = item => {
    setCurrentItem(item);
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
    const load$ = from(loadList()).subscribe();
    return () => {
      load$.unsubscribe();
    }
  }, []);

  const handleSaveNew = async (values) => {
    try {
      setLoading(true);
      const { locale, key, ...payload } = values;
      await saveEmailTemplate(locale, key, payload);
      setDrawerVisible(false);
      await loadList();
    } finally {
      setLoading(false);

    }
  }


  return (
    <ContainerStyled>
      <List
        grid={{
          gutter: 32,
          xs: 1,
          sm: 1,
          md: 2,
          lg: 2,
          xl: 2,
          xxl: 3
        }}
        dataSource={list}
        renderItem={item => <List.Item>
          <Card
            title={item.key}
            extra={<Tooltip key="edit" placement="bottom" title="Edit">
              <Button type="link" icon={<EditOutlined />}
                onClick={() => handleEdit(item)} ></Button>
            </Tooltip>}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {item.key !== 'signature' && <Row gutter={[0, 4]}>
                {item.vars?.map((v, i) => <Col key={i}><Tag color="#4c1bb3">{v}</Tag></Col>)}
              </Row>}
              <Card
                size="small"
                title={<RawHtmlDisplay value={item.subject || 'Subject'} />}
              // type="inner"
              >
                <RawHtmlDisplay value={item.body} />
              </Card>
            </Space>
          </Card>
        </List.Item>}
      />
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
          initialValues={{ ...currentItem, body: currentItem?.body || '' }}
        >
          <Form.Item label="Key" name="key" rules={[{ required: true, whitespace: true, message: ' ' }]}>
            <Input allowClear autoFocus disabled={true} />
          </Form.Item>
          <Form.Item label="Locale" name="locale" rules={[{ required: true, whitespace: true, message: ' ' }]} style={{ display: 'none' }}>
            <LocaleSelector disabled={currentItem || loading} />
          </Form.Item>
          <Form.Item label="Should BCC" name="bcc" valuePropName="checked">
            <Switch disabled={loading} />
          </Form.Item>
          <Form.Item label="Subject" name="subject" rules={[{ required: false, whitespace: true, message: ' ' }]}>
            <Input allowClear disabled={loading} />
          </Form.Item>
          <Form.Item label="Body" name="body" rules={[{ required: false, whitespace: true, message: ' ' }]}>
            <RickTextInput disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button block type="primary" htmlType="submit" disabled={loading}>Save</Button>
          </Form.Item>
        </Form>
      </Drawer>
    </ContainerStyled>

  );
};

EmailTemplateListPage.propTypes = {};

EmailTemplateListPage.defaultProps = {};

export default withRouter(EmailTemplateListPage);
