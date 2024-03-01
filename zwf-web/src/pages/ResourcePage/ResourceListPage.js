import {
  DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, CopyOutlined
} from '@ant-design/icons';
import { Button, Drawer, Layout, Modal, Space, Table, Tooltip, Typography, List, Row, Input, Card, PageHeader } from 'antd';

import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { deleteDocTemplate, listDocTemplate, listDocTemplate$, cloneDocTemplate$ } from 'services/docTemplateService';
import styled from 'styled-components';
import DropdownMenu from 'components/DropdownMenu';
import { HighlightingText } from 'components/HighlightingText';
import { DocTemplateIcon, TaskTemplateIcon } from '../../components/entityIcon';
import { withRouter, Link } from 'react-router-dom';
import { finalize } from 'rxjs/operators';
import { notify } from 'util/notify';
import { listPublishedResourcePages$ } from 'services/resourcePageService';

const { Text, Paragraph, Link: TextLink } = Typography;

const Container = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  // height: calc(100vh - 64px);
  height: 100%;

  .ant-list-item {
    padding-left: 0;
    padding-right: 0;
  }
`;



export const ResourceListPage = props => {


  const [list, setList] = React.useState([]);
  const [filteredList, setFilteredList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setFilteredList(list.filter(x => !searchText || x.name.toLowerCase().includes(searchText.toLowerCase())))
  }, [list, searchText])

  const handleEditOne = (id) => {
    props.history.push(`/doc_template/${id}`);
  }

  const handleEdit = (item) => {
    handleEditOne(item.id);
  }

  const handleDelete = async (item) => {
    const { id, name } = item;
    Modal.confirm({
      title: <>Delete Dot Template <strong>{name}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteDocTemplate(id);
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

  const loadList = async () => {
    setLoading(true);
    const list = await listDocTemplate();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    setLoading(true);
    const sub$ = listPublishedResourcePages$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(setList);

    return () => sub$.unsubscribe();
  }, []);


  return (<>
    <Container>
        <List
          size="small"
          grid={{
            gutter: [24, 24],
            xs: 1,
            sm: 1,
            md: 1,
            lg: 2,
            xl: 3,
            xxl: 4
          }}
          dataSource={filteredList}
          loading={loading}
          renderItem={item => <List.Item>
            <Card
              // size="small"
              bordered={true}
              hoverable
              // type="inner"
              title={<Space>
                <DocTemplateIcon />
                <HighlightingText search={searchText} value={item.name} />
              </Space>}
              extra={<DropdownMenu
                config={[
                  {
                    icon: <EditOutlined />,
                    menu: 'Edit',
                    onClick: () => handleEdit(item)
                  },
                  {
                    icon: <Text type="danger"><DeleteOutlined /></Text>,
                    menu: <Text type="danger">Delete</Text>,
                    onClick: () => handleDelete(item)
                  },
                ].filter(x => !!x)}
              />}
              bodyStyle={{ paddingTop: 16 }}
              onClick={() => handleEdit(item)}
            >
              <Paragraph>{item.description}</Paragraph>
              <Space size="large">
                <TimeAgo key="1" value={item.createdAt} showTime={false} prefix={<Text type="secondary">Created:</Text>} direction="horizontal" />
                <TimeAgo key="2" value={item.updatedAt} showTime={false} prefix={<Text type="secondary">Updated:</Text>} direction="horizontal" />
              </Space>
            </Card>
          </List.Item>}
        />
    </Container>
  </>
  );
};

ResourceListPage.propTypes = {};

ResourceListPage.defaultProps = {};

export default withRouter(ResourceListPage);
