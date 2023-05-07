import Icon, {
  CopyOutlined,
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Button, Card, List, Modal, Space, Typography, Tooltip, Row, Col, Segmented } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cloneTaskTemplate$, deleteTaskTemplate$, listTaskTemplate$ } from 'services/taskTemplateService';
import styled from 'styled-components';
import DropdownMenu from 'components/DropdownMenu';
import { TaskTemplateIcon } from '../../components/entityIcon';
import { notify } from 'util/notify';
import {TaskFieldsPreviewPanel} from './TaskFieldsPreviewPanel';
import { BiGridAlt } from 'react-icons/bi';
import { HiViewList } from 'react-icons/hi';
import { finalize, switchMap } from 'rxjs/operators';
import { PageContainer } from '@ant-design/pro-components';
import { ProFormRadio, ProFormSwitch, ProList } from '@ant-design/pro-components';
import { Descriptions } from 'antd';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';
import { MdDashboardCustomize } from 'react-icons/md';
import { useCreateTaskModal } from 'hooks/useCreateTaskModal';
import { IoDuplicateOutline } from 'react-icons/io5';

const { Text, Paragraph, Link: TextLink } = Typography;

const Container = styled.div`
  .ant-pro-table-list-toolbar {
    display: none;
  }
`;

export const TaskTemplateListPage = () => {
  useAssertRole(['admin', 'agent']);
  const [list, setList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [filteredList, setFilteredList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [previewTaskTemplate, setPreviewTaskTemplate] = React.useState();
  const [viewMode, setViewMode] = React.useState('grid');
  const [previewMode, setPreviewMode] = React.useState('agent');
  const [openCreator, creatorContextHolder] = useCreateTaskModal();

  const navigate = useNavigate();

  const loadList$ = () => {
    setLoading(true)
    return listTaskTemplate$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(list => {
      setList(list);
    });
  }

  React.useEffect(() => {
    const sub$ = loadList$();
    return () => sub$.unsubscribe();
  }, [])

  React.useEffect(() => {
    setFilteredList(list.filter(x => !searchText || x.name.toLowerCase().includes(searchText.toLowerCase())))
  }, [list, searchText])

  const handleEditOne = (id) => {
    navigate(`/femplate/${id}`);
  }

  const handleEdit = (item) => {
    handleEditOne(item.id);
  }


  const handleDelete = async (item) => {
    const { id, name } = item;
    Modal.confirm({
      title: <>Delete Doc Template <strong>{name}</strong>?</>,
      onOk: () => {
        setLoading(true);

        deleteTaskTemplate$(id).pipe(
          finalize(() => setLoading(false)),
          switchMap(() => listTaskTemplate$()),
          finalize(() => setLoading(false)),
        ).subscribe(list => {
          setList(list);
        });
      },
      maskClosable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!'
    });
  }

  const handleCreateNew = () => {
    navigate('/femplate/new');
  }

  const handleClone = item => {
    cloneTaskTemplate$(item.id)
      .subscribe(cloned => {
        // console.log(task);
        notify.success('Cloned task', <>Successfully cloned task template. The new task template is  <TextLink target="_blank" href={`/femplate/${cloned.id}`}>{cloned.name}</TextLink></>, 20);
        loadList$();
      })
  }


  const handleCreateTask = (item) => {
    openCreator({
      femplateId: item.id
    })
  }

  const dataSource = filteredList.map(item => ({
    id: item.id,
    data: item,
    title: item.name,
    avatar: <TaskTemplateIcon />,
    description: <>balah</>,
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
  }))


  return (<Container>
    <PageHeaderContainer
      breadcrumb={[
        {
          name: 'Templates'
        },
        {
          name: 'Form Template',
        }
      ]}
      title='Form Template'
      loading={loading}
      extra={[
        // <Segmented key="views"
        //   onChange={setViewMode}
        //   value={viewMode}
        //   options={[
        //     {
        //       icon: <Icon component={BiGridAlt} />,
        //       value: 'grid'
        //     },
        //     {
        //       icon: <Icon component={HiViewList} />,
        //       value: 'list'
        //     },
        //   ]} />,
        <Button key="new" type="primary" ghost icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Form Template</Button>
      ]}
    >
      <ProList
        headerTitle=" "
        onRow={(row) => {
          return {
            onMouseEnter: () => {
            },
            onClick: () => {
              handleEdit(row.data)
            },
          };
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
        locale={{
          emptyText: <div style={{ margin: '30px auto' }}>
            <Paragraph type="secondary">
              There is no form template. Let's start creating one!
            </Paragraph>
            <Link to="/femplate/new">Create new form template</Link>
          </div>
        }}
        ghost={viewMode === 'grid'}
        rowKey="id"
        dataSource={dataSource}
        showActions="hover"
        showExtra="hover"
        grid={viewMode === 'grid' ? {
          gutter: [24, 24],
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 3,
          xxl: 4
        } : null}
        metas={{
          title: {},
          subTitle: {},
          type: {},
          avatar: {},
          content: {},
          actions: {
            render: (text, row) => [
              <Tooltip title="Create task with this" key="new">
                <Button icon={<Icon component={MdDashboardCustomize} />} type="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTask(row.data)
                  }}></Button>
              </Tooltip>,
              <DropdownMenu
                key="others"
                config={[
                  {
                    icon: <EditOutlined />,
                    menu: 'Edit',
                    onClick: () => handleEdit(row.data)
                  },
                  {
                    icon: <Icon component={MdDashboardCustomize} />,
                    menu: 'Create task',
                    onClick: () => handleCreateTask(row.data),
                  },
                  {
                    icon: <EyeOutlined />,
                    menu: 'Preview',
                    onClick: () => {
                      setPreviewTaskTemplate(row.data);
                    }
                  },
                  {
                    icon: <Icon component={IoDuplicateOutline} />,
                    menu: 'Duplicate',
                    onClick: () => handleClone(row.data)
                  },
                  {
                    menu: '-'
                  },
                  {
                    icon: <Text type="danger"><CloseOutlined /></Text>,
                    menu: <Text type="danger">Delete</Text>,
                    onClick: () => handleDelete(row.data)
                  },
                ].filter(x => !!x)}
              />
            ],
          },
        }}
      />
      <Modal
        open={!!previewTaskTemplate}
        onOk={() => setPreviewTaskTemplate(null)}
        onCancel={() => setPreviewTaskTemplate(null)}
        closable
        destroyOnClose
        maskClosable
        title={<Segmented
          options={['agent', 'client', 'profile']}
          onChange={setPreviewMode} />}
        footer={null}
      >
        <TaskFieldsPreviewPanel
          name={previewTaskTemplate?.name}
          fields={previewTaskTemplate?.fields}
          mode={previewMode}
        />
      </Modal>
    </PageHeaderContainer>
    {creatorContextHolder}
  </Container>)
};

TaskTemplateListPage.propTypes = {};

TaskTemplateListPage.defaultProps = {};

export default TaskTemplateListPage;
