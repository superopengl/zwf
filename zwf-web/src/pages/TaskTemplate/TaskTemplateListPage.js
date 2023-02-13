import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Button, Card, List, Modal, Space, Typography, Tooltip, Row, Col, Segmented } from 'antd';
import Icon from '@ant-design/icons';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cloneTaskTemplate$, deleteTaskTemplate$, listTaskTemplate$ } from 'services/taskTemplateService';
import styled from 'styled-components';
import DropdownMenu from 'components/DropdownMenu';
import { TaskTemplateIcon } from '../../components/entityIcon';
import { notify } from 'util/notify';
import TaskTemplatePreviewPanel from './TaskTemplatePreviewPanel';
import { BiGridAlt } from 'react-icons/bi';
import { HiViewList } from 'react-icons/hi';
import { CreateTaskModal } from 'components/CreateTaskModal';
import { DocTemplateListPanel } from 'components/DocTemplateListPanel';
import { finalize, switchMap } from 'rxjs/operators';
import { PageContainer } from '@ant-design/pro-components';
import { ProFormRadio, ProFormSwitch, ProList } from '@ant-design/pro-components';

const { Text, Paragraph, Link: TextLink } = Typography;





export const TaskTemplateListPage = () => {
  const [list, setList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [filteredList, setFilteredList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [previewTaskTemplate, setPreviewTaskTemplate] = React.useState();
  const [viewMode, setViewMode] = React.useState('grid');
  const [currentTaskTemplateId, setCurrentTaskTemplateId] = React.useState(null);
  const [modalVisible, setModalVisible] = React.useState(false)
  const [previewMode, setPreviewMode] = React.useState('agent');

  const navigate = useNavigate();

  const loadList = async () => {
    setLoading(true);
    const list = await listTaskTemplate$();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    setLoading(true);

    const sub$ = listTaskTemplate$().pipe(
      finalize(() => setLoading(false))
    ).subscribe(list => {
      setList(list);
    });

    return () => sub$.unsubscribe();
  }, [])

  React.useEffect(() => {
    setFilteredList(list.filter(x => !searchText || x.name.toLowerCase().includes(searchText.toLowerCase())))
  }, [list, searchText])

  const handleEditOne = (id) => {
    navigate(`/task_template/${id}`);
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
    navigate('/task_template/new');
  }

  const handleClone = item => {
    cloneTaskTemplate$(item.id)
      .subscribe(cloned => {
        // console.log(task);
        notify.success('Cloned task', <>Successfully cloned task template. The new task template is  <TextLink target="_blank" href={`/task_template/${cloned.id}`}>{cloned.name}</TextLink></>, 20);
        loadList();
      })
  }


  const handleCreateTask = (item) => {
    setCurrentTaskTemplateId(item.id);
    setModalVisible(true);
  }

  const dataSource = filteredList.map(item => ({
    id: item.id,
    data: item,
    title: item.name,
    avatar: <TaskTemplateIcon />,
    description: <>balah</>,
    content: <>
      <Row gutter={[8, 8]}>
        <Col>
          <TimeAgo key="1" value={item.createdAt} showTime={false} prefix={<Text type="secondary">Created:</Text>} direction="horizontal" />
        </Col>
        <Col>
          <TimeAgo key="2" value={item.updatedAt} showTime={false} prefix={<Text type="secondary">Updated:</Text>} direction="horizontal" />
        </Col>
      </Row>
      <DocTemplateListPanel value={item.docs} style={{ margin: '12px -12px 0' }} bordered={false} />
    </>
  }))


  return (
    <PageContainer
      header={{
        title: 'Task Templates',
        extra: [
          <Segmented key="views"
            onChange={setViewMode}
            value={viewMode}
            options={[
              {
                icon: <Icon component={BiGridAlt} />,
                value: 'grid'
              },
              {
                icon: <Icon component={HiViewList} />,
                value: 'list'
              },
            ]} />,
          <Button key="new" type="primary" icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Form Template</Button>
        ]
      }}
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
              <Tooltip title="Create task with this task template" key="new">
                <Button icon={<PlusOutlined />} type="text"
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
                    icon: <PlusOutlined />,
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
          options={['agent', 'client']}
          onChange={setPreviewMode} />}
        footer={null}
      >
        <TaskTemplatePreviewPanel
          value={previewTaskTemplate}
          mode={previewMode}
        />
      </Modal>
      <CreateTaskModal
        taskTemplateId={currentTaskTemplateId}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => setModalVisible(false)}
      />
    </PageContainer>
  );
};

TaskTemplateListPage.propTypes = {};

TaskTemplateListPage.defaultProps = {};

export default TaskTemplateListPage;
