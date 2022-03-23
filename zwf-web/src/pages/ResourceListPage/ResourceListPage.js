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

const { Text, Paragraph, Link: TextLink } = Typography;

const LayoutStyled = styled.div`
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
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentId, setCurrentId] = React.useState();

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
    const subscription$ = listDocTemplate$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(list => {
        setList(list);
      });

    return () => subscription$.unsubscribe();
  }, []);


  const handleCreateNew = () => {
    props.history.push('/resources/new');
  }

  return (<>
    <LayoutStyled>
      <PageHeader
        title="Resources"
        backIcon={false}
        extra={[
          // <Radio.Group
          //   key="view"
          //   optionType="button"
          //   buttonStyle="solid"
          //   defaultValue={viewMode}
          //   onChange={e => setViewMode(e.target.value)}
          // >
          //   <Radio.Button value="grid">
          //     <Icon component={() => <BiGridAlt />} />
          //   </Radio.Button>
          //   <Radio.Button value="list">
          //     <Icon component={() => <HiViewList />} />
          //   </Radio.Button>
          // </Radio.Group>,
          <Button type="primary" key="new" icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Page</Button>
        ]}
      >
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
          locale={{
            emptyText: <div style={{ margin: '30px auto' }}>
              <Paragraph type="secondary">
                There is no resources. Let's start creating one!
              </Paragraph>
              <Link to="/resources/new">Create new resource page</Link>
            </div>
          }}
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
      </PageHeader>
    </LayoutStyled>
  </>
  );
};

ResourceListPage.propTypes = {};

ResourceListPage.defaultProps = {};

export default withRouter(ResourceListPage);
