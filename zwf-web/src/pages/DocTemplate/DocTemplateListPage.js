import {
  DeleteOutlined, EditOutlined, PlusOutlined, CopyOutlined
} from '@ant-design/icons';
import { Button, Modal, Typography } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { deleteDocTemplate$, listDocTemplate$ } from 'services/docTemplateService';
import styled from 'styled-components';
import DropdownMenu from 'components/DropdownMenu';
import { DocTemplateIcon } from '../../components/entityIcon';
import { useNavigate, Link } from 'react-router-dom';
import { finalize, switchMap } from 'rxjs/operators';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { ProList } from '@ant-design/pro-components';
import { Descriptions } from 'antd';
import {useCloneDocTemplateModal} from './useCloneDocTemplateModal';

const { Text, Paragraph } = Typography;

const Container = styled.div`
  .ant-pro-table-list-toolbar {
    display: none;
  }
`;



export const DocTemplateListPage = () => {
  const [list, setList] = React.useState([]);
  const [filteredList, setFilteredList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [cloneAction, cloneContextHolder] = useCloneDocTemplateModal();
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

  const handleClone = docTemplate => {
    cloneAction({
      targetId: docTemplate.id,
      name: `Clone - ${docTemplate.name}`,
      onOk: () => {
        setLoading(true);
        listDocTemplate$().pipe(
          finalize(() => setLoading(false)),
        ).subscribe(list => {
          setList(list);
        });
      }
    })
  }

  const dataSource = filteredList.map(item => ({
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

  return (<Container>
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
    {cloneContextHolder}
  </Container>
  );
};

DocTemplateListPage.propTypes = {};

DocTemplateListPage.defaultProps = {};

export default DocTemplateListPage;
