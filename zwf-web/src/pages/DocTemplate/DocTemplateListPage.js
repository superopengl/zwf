import {
  DeleteOutlined, EditOutlined, PlusOutlined, CopyOutlined
} from '@ant-design/icons';
import { Button, Modal, Space, Typography, List, Card } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { deleteDocTemplate$, listDocTemplate$, cloneDocTemplate$ } from 'services/docTemplateService';
import styled from 'styled-components';
import DropdownMenu from 'components/DropdownMenu';
import { HighlightingText } from 'components/HighlightingText';
import { DocTemplateIcon } from '../../components/entityIcon';
import { useNavigate, Link } from 'react-router-dom';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { notify } from 'util/notify';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { ProFormRadio, ProFormSwitch, ProList } from '@ant-design/pro-components';
import { Descriptions } from 'antd';

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



export const DocTemplateListPage = props => {
  const [list, setList] = React.useState([]);
  const [filteredList, setFilteredList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [currentId, setCurrentId] = React.useState();
  const navigate = useNavigate();

  React.useEffect(() => {
    setFilteredList(list.filter(x => !searchText || x.name.toLowerCase().includes(searchText.toLowerCase())))
  }, [list, searchText])

  const handleEditOne = (id) => {
    navigate(`/doc_template/${id}`);
  }

  const handleEdit = (item) => {
    handleEditOne(item.id);
  }

  const handleDelete = (item) => {
    const { id, name } = item;
    Modal.confirm({
      title: <>Delete Dot Template <Text code>{name}</Text>?</>,
      onOk: () => {
        setLoading(true);
        deleteDocTemplate$(id).pipe(
          finalize(() => setLoading(false)),
          switchMap(() => listDocTemplate$()),
          finalize(() => setLoading(false)),
        ).subscribe(list => {
          setList(list);
        });
      },
      maskClosable: true,
      closable: true,
      okButtonProps: {
        danger: true
      },
      cancelButtonProps: {
        type: 'text',
      },
      okText: 'Yes, delete'
    });
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
    navigate('/doc_template/new');
  }


  const handlePreview = () => {
  }

  const handleClone = item => {
    cloneDocTemplate$(item.id).pipe(
      tap(cloned => notify.success('Cloned task', <>Successfully cloned doc template. The new doc template is  <TextLink target="_blank" href={`/doc_template/${cloned.id}`}>{cloned.name}</TextLink></>, 20)),
      switchMap(() => listDocTemplate$()),
      finalize(() => setLoading(false)),
    ).subscribe(list => {
      setList(list);
    });
  }

  const dataSource = filteredList.map(item =>({
    id: item.id,
    data: item,
    title: item.name,
    avatar: <DocTemplateIcon />,
    content: <>
    <Descriptions size="small">
      <Descriptions.Item label="created" span={12}>
        <TimeAgo value={item.createdAt} showTime={false} direction="horizontal" />
      </Descriptions.Item>
      <Descriptions.Item label="updated" span={12}>
        <TimeAgo value={item.updatedAt} showTime={false} direction="horizontal" />
      </Descriptions.Item>
    </Descriptions>
  </>
  }));

  return (<>
      <PageHeaderContainer
      breadcrumb={[
        {
          name: 'Templates'
        },
        {
          name: 'Doc Template',
        },
      ]}
      loading={loading}
      title='Doc Templates'
      extra={[
        <Button type="primary" key="new" icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Doc Template</Button>
      ]}
      >
        <ProList
        headerTitle=" "
        grid={{
            gutter: [24, 24],
            xs: 1,
            sm: 1,
            md: 1,
            lg: 2,
            xl: 3,
            xxl: 4
          }}
          ghost
          dataSource={dataSource}
          loading={loading}
          locale={{
            emptyText: <div style={{ margin: '30px auto' }}>
              <Paragraph type="secondary">
                There is no doc template. Let's start creating one!
              </Paragraph>
              <Link to="/doc_template/new">Create new doc template</Link>
            </div>
          }}
          onItem={(row) => {
            return {
              onMouseEnter: () => {
              },
              onClick: () => {
                handleEdit(row.data)
              },
            };
          }}
          metas={{
            title: {},
            subTitle: {},
            type: {},
            avatar: {},
            content: {},
            actions: {
              render: (text, row) => [
                <DropdownMenu
                  key="others"
                  config={[
                    {
                      icon: <EditOutlined />,
                      menu: 'Edit',
                      onClick: () => handleEdit(row.data)
                    },
                    {
                      icon: <CopyOutlined />,
                      menu: 'Clone',
                      onClick: () => handleClone(row.data)
                    },
                    {
                      menu: '-'
                    },
                    {
                      icon: <Text type="danger"><DeleteOutlined /></Text>,
                      menu: <Text type="danger">Delete</Text>,
                      onClick: () => handleDelete(row.data)
                    }]}
                />
              ],
            },
          }}

        />
      </PageHeaderContainer>
  </>
  );
};

DocTemplateListPage.propTypes = {};

DocTemplateListPage.defaultProps = {};

export default DocTemplateListPage;
