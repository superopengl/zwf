import {
  DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined, EyeInvisibleOutlined, SyncOutlined
} from '@ant-design/icons';
import { Button, Modal, Space, Typography, List, Card, Image } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import styled from 'styled-components';
import DropdownMenu from 'components/DropdownMenu';
import { HighlightingText } from 'components/HighlightingText';
import { ResourcePageIcon } from '../../components/entityIcon';
import { useNavigate, Link } from 'react-router-dom';
import { finalize } from 'rxjs/operators';
import { deleteResourcePage$, listAllResourcePages$, saveResourcePage$ } from 'services/resourcePageService';
import { PageContainer } from '@ant-design/pro-components';

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

  .published-page {
    border-left: 4px solid #0FBFC4;
  }

  .unpublished-page {
    border-left: 4px solid #ffc53d;
  }
`;



export const ResourceEditListPage = props => {


  const [list, setList] = React.useState([]);
  const [filteredList, setFilteredList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const [modal, contextHolder] = Modal.useModal();

  React.useEffect(() => {
    setFilteredList(list.filter(x => !searchText || x.name.toLowerCase().includes(searchText.toLowerCase())))
  }, [list, searchText])

  const handleEdit = (item) => {
    navigate(`/manage/resource/${item.id}`);
  }

  const handleTogglePublished = (item) => {
    const { publishedAt } = item;
    item.publishedAt = publishedAt ? null : new Date();

    saveResourcePage$(item)
      .subscribe()
      .add(() => loadList$())
  }

  const handleDelete = async (item) => {
    const { id, title } = item;
    modal.confirm({
      title: <>Delete resource page <strong>{title}</strong>?</>,
      onOk: () => {
        deleteResourcePage$(id)
          .subscribe()
          .add(() => loadList$());
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete this page!'
    });
  }

  const loadList$ = () => {
    setLoading(true);
    return listAllResourcePages$()
      .pipe(
        finalize(() => setLoading(false))
      )
      .subscribe(setList);
  }

  React.useEffect(() => {
    const sub$ = loadList$();
    return () => sub$.unsubscribe();
  }, []);


  const handleCreateNew = () => {
    navigate('/manage/resource/new');
  }

  return (<>
    <LayoutStyled>
      <PageContainer
        header={{
          title: 'Resources',
          extra: [
            <Button type="primary" ghost key="refres" icon={<SyncOutlined />} onClick={() => loadList$()}></Button>,
            <Button type="primary" key="new" icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Page</Button>,          ]
        }}
      >
        <List
          size="small"
          grid={{
            gutter: [24, 24],
            xs: 1,
            sm: 1,
            md: 1,
            lg: 1,
            xl: 2,
            xxl: 2
          }}
          dataSource={filteredList}
          loading={loading}
          locale={{
            emptyText: <div style={{ margin: '30px auto' }}>
              <Paragraph type="secondary">
                There is no resources. Let's start creating one!
              </Paragraph>
              <Link to="/manage/resource/new">Create new resource page</Link>
            </div>
          }}
          renderItem={item => <List.Item>
            <Card
              // size="small"
              bordered={true}
              hoverable
              // type="inner"
              className={item.publishedAt ? 'published-page' : 'unpublished-page'}
              title={<Space>
                <ResourcePageIcon />
                <HighlightingText search={searchText} value={item.title} />
              </Space>}
              extra={<DropdownMenu
                config={[
                  {
                    icon: item.publishedAt ? <EyeInvisibleOutlined /> : <EyeOutlined />,
                    menu: item.publishedAt ? 'Unpublish' : 'Publish',
                    onClick: () => handleTogglePublished(item)
                  },
                  {
                    icon: <EditOutlined />,
                    menu: 'Edit',
                    onClick: () => handleEdit(item)
                  },
                  item.publishedAt ? null : {
                    menu: '-'
                  },
                  item.publishedAt ? null : {
                    icon: <Text type="danger"><DeleteOutlined /></Text>,
                    menu: <Text type="danger">Delete</Text>,
                    onClick: () => handleDelete(item)
                  },
                ].filter(x => !!x)}
              />}
              bodyStyle={{ paddingTop: 16 }}
              onClick={() => handleEdit(item)}
            >
              <Paragraph type="secondary">
                <small>
                  <Space size="large">
                    <TimeAgo value={item.createdAt} showTime={false} prefix="Created:" direction="horizontal" />
                    <TimeAgo value={item.updatedAt} showTime={false} prefix="Updated" direction="horizontal" />
                    <TimeAgo value={item.publishedAt} showTime={false} prefix="Published" direction="horizontal" />
                  </Space>
                </small>
              </Paragraph>
              <Space style={{ alignItems: 'flex-start' }}>
                {item.imageBase64 && <Image src={item.imageBase64} width={200} preview={false} />}
                <Paragraph>{item.brief}...</Paragraph>
              </Space>

            </Card>
          </List.Item>}
        />
      </PageContainer>
      {contextHolder}
    </LayoutStyled>
  </>
  );
};

ResourceEditListPage.propTypes = {};

ResourceEditListPage.defaultProps = {};

export default ResourceEditListPage;
