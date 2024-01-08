import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined, SearchOutlined
} from '@ant-design/icons';
import { Button, Card, List, Modal, Space, Row, Col, Input, Typography, Tooltip, Radio } from 'antd';
import Icon from '@ant-design/icons';
import { TimeAgo } from 'components/TimeAgo';
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { cloneTaskTemplate$, deleteTaskTemplate, listTaskTemplate } from 'services/taskTemplateService';
import styled from 'styled-components';
import DropdownMenu from 'components/DropdownMenu';
import HighlightingText from 'components/HighlightingText';
import { DocTemplateIcon, TaskTemplateIcon } from '../../components/entityIcon';
import TaskClientSelectModal from 'components/TaskClientSelectModal';
import { notify } from 'util/notify';
import TaskTemplatePreviewPanel from './TaskTemplatePreviewPanel';
import { NewTaskOnTemplateModal } from 'pages/TaskTemplate/NewTaskOnTemplateModal';
import {BiGridAlt} from 'react-icons/bi';
import {HiViewList} from 'react-icons/hi';

const { Title, Text, Paragraph, Link: TextLink } = Typography;


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



export const TaskTemplateListPage = props => {
  const [list, setList] = React.useState([]);
  const [searchText, setSearchText] = React.useState('');
  const [filteredList, setFilteredList] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectClientVisible, setSelectClientVisible] = React.useState(false);
  const [currentTemplate, setCurrentTemplate] = React.useState();
  const [previewTaskTemplate, setPreviewTaskTemplate] = React.useState();
  const [newTaskVisible, setNewTaskVisible] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('grid');

  const loadList = async () => {
    setLoading(true);
    const list = await listTaskTemplate();
    setList(list);
    setLoading(false);
  }

  React.useEffect(() => {
    loadList();
  }, [])

  React.useEffect(() => {
    setFilteredList(list.filter(x => !searchText || x.name.toLowerCase().includes(searchText.toLowerCase())))
  }, [list, searchText])

  const handleEditOne = (id) => {
    props.history.push(`/task_template/${id}`);
  }

  const handleEdit = (item) => {
    handleEditOne(item.id);
  }

  const handlePreview = (item) => {
  }

  const handleDelete = async (item) => {
    const { id, name } = item;
    Modal.confirm({
      title: <>Delete Doc Template <strong>{name}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteTaskTemplate(id);
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

  const handleCreateNew = () => {
    props.history.push('/task_template/new');
  }

  const handleClone = item => {
    cloneTaskTemplate$(item.id)
      .subscribe(cloned => {
        // console.log(task);
        notify.success('Cloned task', <>Successfully cloned task template. The new task template is  <TextLink target="_blank" href={`/task_template/${cloned.id}`}>{cloned.name}</TextLink></>, 20);
        loadList();
      })
  }
  // const handleCancelCreateTask = () => {
  //   setSelectClientVisible(false);
  //   setCurrentTemplate(null);
  // }

  const span = {
    xs: 24,
    sm: 24,
    md: 24,
    lg: 12,
    xl: 12,
    xxl: 12
  }

  const handleSearchFilter = (text) => {
    setSearchText(text);
  }

  const handleCreateTask = (item) => {
    setCurrentTemplate(item);
  }

  const handleCancelCreateTask = () => {
    setCurrentTemplate(null);
  }


  return (
    <LayoutStyled>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Row justify="space-between">
          <Input placeholder="Filter task name"
            onChange={e => handleSearchFilter(e.target.value)}
            allowClear
            prefix={<Text type="secondary"><SearchOutlined /></Text>}
            style={{ width: 240 }} />
          <Space>
    <Radio.Group 
    optionType="button"
    buttonStyle="solid"
    defaultValue={viewMode}
    onChange={e => setViewMode(e.target.value)}
    >
      <Radio.Button value="grid">
        <Icon component={() => <BiGridAlt/>} />
      </Radio.Button>
      <Radio.Button value="list">
        <Icon component={() => <HiViewList/>} />
      </Radio.Button>
    </Radio.Group>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Task Template</Button>
          </Space>
        </Row>
        {/* <Table columns={columnDef}
          size="small"
          dataSource={list}
          rowKey="id"
          loading={loading}
          pagination={false}
          // onChange={handleTableChange}
          onRow={(record) => ({
            onDoubleClick: () => handleEditOne(record.id)
          })}
          locale={{
            emptyText: <div style={{ margin: '30px auto', fontSize: 14 }}>
              <Paragraph type="secondary">
                There is no defined task template. Let's start from creating a new task template.
              </Paragraph>
              <Link to="/task_template/new">Create new task template</Link>
            </div>
          }}
        /> */}
        <List
          size="small"
          grid={viewMode === 'grid' ? {
            gutter: [12, 12],
            xs: 1,
            sm: 1,
            md: 1,
            lg: 1,
            xl: 2,
            xxl: 3
          } : {
            gutter: [12, 12],
            column: 1
          }}
          dataSource={filteredList}
          loading={loading}
          locale={{
            emptyText: <div style={{ margin: '30px auto' }}>
              <Paragraph type="secondary">
                There is no task template. Let's start from a one!
              </Paragraph>
              <Link to="/task_template/new">Create new task template</Link>
            </div>
          }}
          renderItem={item => <List.Item>
            <Card
              // size="small"
              bordered={true}
              hoverable
              // type="inner"
              title={<>
                <TaskTemplateIcon />
                <Text>{item.name}</Text>
                {/* <Input bordered={false} value={item.name} /> */}
                {/* <HighlightingText search={searchText} value={item.name} /> */}
              </>}
              extra={<Space size="small">
                <Tooltip title="Create task with this task template">
                <Button icon={<PlusOutlined />} type="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateTask(item)
                  }}></Button>
                  </Tooltip>
                <DropdownMenu
                  config={[
                    {
                      icon: <PlusOutlined />,
                      menu: 'Create task',
                      onClick: () => handleCreateTask(item),
                    },
                    {
                      menu: '-'
                    },
                    {
                      icon: <EyeOutlined />,
                      menu: 'Preview',
                      onClick: () => {
                        setPreviewTaskTemplate(item);
                      }
                    },
                    {
                      icon: <CopyOutlined />,
                      menu: 'Clone',
                      onClick: () => handleClone(item)
                    },
                    {
                      icon: <EditOutlined />,
                      menu: 'Edit',
                      onClick: () => handleEdit(item)
                    },
                    {
                      menu: '-'
                    },
                    {
                      icon: <Text type="danger"><DeleteOutlined /></Text>,
                      menu: <Text type="danger">Delete</Text>,
                      onClick: () => handleDelete(item)
                    },

                  ].filter(x => !!x)}
                /></Space>}
              bodyStyle={{ paddingTop: 16 }}
            // onClick={() => handleEdit(item)}
            >
              <Paragraph>{item.description}</Paragraph>
              <Space size="large">
                <TimeAgo key="1" value={item.createdAt} showTime={false} prefix={<Text type="secondary">Created:</Text>} direction="horizontal" />
                <TimeAgo key="2" value={item.lastUpdatedAt} showTime={false} prefix={<Text type="secondary">Updated:</Text>} direction="horizontal" />
              </Space>
              {/* <Paragraph style={{ marginBottom: 0, marginTop: 10 }} ellipsis={{ row: 3 }}>{item.description}</Paragraph> */}
              {item.docNames?.length && <Row style={{ marginTop: 20 }} gutter={[20, 20]}>
                {item.docNames?.map((d, i) => <Col key={i}>
                  <DocTemplateIcon style={{fontSize: 10, position: 'relative', top: -3}} />{d}
                </Col>)}
              </Row>}
            </Card>
          </List.Item>}
        />
      </Space>
      <TaskClientSelectModal
        visible={selectClientVisible}
        onOk={handleCreateTask}
        onCancel={handleCancelCreateTask}
      />
      <Modal
        visible={!!previewTaskTemplate}
        onOk={() => setPreviewTaskTemplate(null)}
        onCancel={() => setPreviewTaskTemplate(null)}
        closable
        destroyOnClose
        maskClosable
        footer={null}
      >
        <TaskTemplatePreviewPanel
          value={previewTaskTemplate}
          type="agent"
        />
      </Modal>
      <NewTaskOnTemplateModal
        visible={!!currentTemplate}
        taskTemplateId={currentTemplate?.id}
        onOk={() => setCurrentTemplate(null)}
        onCancel={handleCancelCreateTask}
      />
    </LayoutStyled >
  );
};

TaskTemplateListPage.propTypes = {};

TaskTemplateListPage.defaultProps = {};

export default withRouter(TaskTemplateListPage);
