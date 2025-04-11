import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Drawer, Table, Tooltip, Modal, Row } from 'antd';
import Text from 'antd/lib/typography/Text';
import {
  CloseOutlined, EditOutlined, CaretRightFilled, PlusOutlined, ClockCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { Space } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { listRecurring$, deleteRecurring, runRecurring } from 'services/recurringService';
import RecurringEditModal from './RecurringEditModal';
import { notify } from 'util/notify';
import { PageHeaderContainer } from 'components/PageHeaderContainer';
import { useAssertRole } from 'hooks/useAssertRole';
import { ClientNameCard } from 'components/ClientNameCard';

const { Link: TextLink, Paragraph } = Typography;

const RecurringListPage = () => {
  useAssertRole(['admin', 'agent']);
  const [loading, setLoading] = React.useState(true);
  const [formVisible, setFormVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [currentId, setCurrentId] = React.useState();
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();

  const isRecurringDeprecated = item => !item.orgClientId || !item.taskTemplateId;

  const columnDef = [
    {
      title: 'Name',
      dataIndex: 'recurringName',
      fixed: 'left',
      render: (text) => text,
      ellipsis: false
    },
    {
      title: 'Client',
      dataIndex: 'orgClientId',
      onFilter: (value, record) => record.assigneeId === value,
      render: (value) => <ClientNameCard id={value} />
    },
    {
      title: 'Form Template',
      dataIndex: 'taskTemplateName',
      render: (text, record) => record.taskTemplateName ? <Link to={`/task_template/${record.taskTemplateId}`}>{text}</Link> : <Text type="danger">deleted task template</Text>,
      ellipsis: false
    },
    {
      title: 'Frequency',
      render: (text, record) => {
        const { every, period } = record;
        return <Text>{every} {period}{every === 1 ? null : 's'}</Text>;
      }
    },
    // {
    //   title: 'Schedule',
    //   render: (text, record) => {
    //     const deprecated = isRecurringDeprecated(record);
    //     const { firstRunOn, every, period, lastRunAt, nextRunAt } = record;
    //     return <StylePatternTable>
    //       <tbody>
    //         {firstRunOn && <tr>
    //           <td className="label">
    //             <small>Start From</small>
    //           </td>
    //           <td>
    //             <TimeAgo value={firstRunOn} direction="horizontal" />
    //           </td>
    //         </tr>}
    //         <tr>
    //           <td className="label">
    //             <small>Last Run</small>
    //           </td>
    //           <td>
    //             {!lastRunAt ? <Text type="secondary"><DashOutlined /></Text> : <TimeAgo value={lastRunAt} direction="horizontal" />}
    //           </td>
    //         </tr>
    //         <tr>
    //           <td className="label">
    //             <small>Next Run</small>
    //           </td>
    //           <td>
    //             {deprecated || !nextRunAt ? <Text type="secondary"><DashOutlined /></Text> : <TimeAgo value={nextRunAt} direction="horizontal" />}
    //           </td>
    //         </tr>
    //       </tbody>
    //     </StylePatternTable>;
    //   }
    // },
    {
      title: 'Start From',
      dataIndex: 'firstRunOn',
      render: (value) => <TimeAgo value={value} />
    },
    {
      title: 'Last Run At',
      dataIndex: 'lastRunAt',
      render: (value) => <TimeAgo value={value} />
    },
    {
      title: 'Next Run At',
      dataIndex: 'nextRunAt',
      render: (value) => <TimeAgo value={value} />
    },
    {
      // title: 'Action',
      fixed: 'right',
      aligh: 'right',
      width: 120,
      render: (text, record) => {
        const deprecated = isRecurringDeprecated(record);
        return (
          <Row>
            <Tooltip title="Edit recurring"><Button type="text" icon={<EditOutlined />} onClick={e => handleEditRecurring(e, record)} disabled={deprecated} /></Tooltip>
            <Tooltip title="Run immediately"><Button type="text" icon={<CaretRightFilled />} onClick={e => handleRunRecurring(e, record)} disabled={deprecated} /></Tooltip>
            <Tooltip title="Delete recurring"><Button type="text" danger icon={<CloseOutlined />} onClick={e => handleDelete(e, record)} /></Tooltip>
          </Row>
        )
      },
    },
  ];

  const loadList$ = () => {
    setLoading(true);
    return listRecurring$().subscribe(list => {
      setList(list);
      setLoading(false);
    })
  }

  React.useEffect(() => {
    const sub$ = loadList$();
    return () => sub$.unsubscribe();
  }, []);

  const handleCreateNew = async () => {
    setCurrentId();
    setFormVisible(true);
  }

  const handleEditRecurring = async (e, record) => {
    e.stopPropagation();
    setCurrentId(record.id);
    setFormVisible(true);
  }

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    const { id, taskTemplateName, portfolioName, recurringName, orgClientId } = item;
    modal.confirm({
      title: <>Delete scheduler</>,
      content: <Space direction="vertical">
        <Text>Delete scheduler job <Text code>{recurringName}</Text> for below user?</Text>
        <ClientNameCard id={orgClientId} />
      </Space>,
      onOk: async () => {
        setLoading(true);
        await deleteRecurring(id);
        await loadList$();
        setLoading(false);
      },
      maskClosable: true,
      closable: true,
      okButtonProps: {
        danger: true
      },
      okText: 'Yes, delete it!',
      cancelButtonProps: {
        type: 'text'
      },
      autoFocusButton: 'cancel',
    });
  }

  const handleRunRecurring = async (e, item) => {
    e.stopPropagation();
    const { id } = item;
    const task = await runRecurring(id);
    const notice = notify.success(
      'Successfully run the recurring',
      <Text>Task <TextLink strong onClick={() => {
        notice.close();
        navigate(`/task/${task.id}`);
      }}>{task.name}</TextLink> was created</Text>,
      15
    );
  }

  const handleEditOnOk = () => {
    loadList$();
    setFormVisible(false);
  }

  return (
    <PageHeaderContainer
      breadcrumb={[
        {
          name: 'Tasks'
        },
        {
          name: 'Recurring',
        },
      ]}
      loading={loading}
      title="Recurring"
      extra={[
        <Button key="new" type="primary" ghost icon={<ClockCircleOutlined />} onClick={handleCreateNew}>New Recurring</Button>
      ]}
    >
      <Table columns={columnDef}
        dataSource={list}
        size="small"
        scroll={{
          x: 'max-content'
        }}
        rowKey="id"
        pagination={false}
        // pagination={queryInfo}
        // onChange={handleTableChange}
        onRow={(record) => ({
          onDoubleClick: () => {
            setCurrentId(record.id);
            setFormVisible(true);
          }
        })}
        locale={{
          emptyText: <div style={{ margin: '30px auto' }}>
            <Paragraph type="secondary">
              There is no scheduler. Let's start creating one!
            </Paragraph>
            <Link onClick={handleCreateNew}>Create new scheduler</Link>
          </div>
        }}
      />
      <RecurringEditModal id={currentId}
        visible={formVisible}
        onOk={handleEditOnOk}
        onCancel={() => setFormVisible(false)}
      />
      {contextHolder}
    </PageHeaderContainer>

  );
};

RecurringListPage.propTypes = {};

RecurringListPage.defaultProps = {};

export default RecurringListPage;
