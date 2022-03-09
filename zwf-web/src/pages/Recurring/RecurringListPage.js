import React from 'react';
import styled from 'styled-components';
import { Typography, Layout, Button, Drawer, Table, Tooltip, Modal, Alert } from 'antd';
import Text from 'antd/lib/typography/Text';
import {
  DeleteOutlined, EditOutlined, CaretRightFilled, PlusOutlined, DashOutlined
} from '@ant-design/icons';
import { Link, withRouter } from 'react-router-dom';
import { Space } from 'antd';
import { TimeAgo } from 'components/TimeAgo';
import { listRecurring, deleteRecurring, runRecurring } from 'services/recurringService';
import RecurringForm from './RecurringForm';
import { notify } from 'util/notify';
import * as ReactDom from 'react-dom';

const { Title, Link: TextLink } = Typography;

const ContainerStyled = styled.div`
margin: 6rem 0 2rem 0;
padding: 0 1rem 4rem;
`;

const StyledTitleRow = styled.div`
 display: flex;
 justify-content: space-between;
 align-items: center;
 width: 100%;
`

const LayoutStyled = styled.div`
  margin: 0 auto 0 auto;
  // background-color: #ffffff;
  height: 100%;
`;


const StyledDrawer = styled(Drawer)`

.ant-drawer-content-wrapper {
  max-width: 90vw;
}

.rce-mbox {
  padding-bottom: 2rem;

  .rce-mbox-time {
    bottom: -1.5rem;
  }
}
`;

const StylePatternTable = styled.table`
td.label {
  width: 70px;
}

td {
  padding: 0;
}
`;

const RecurringListPage = (props) => {

  const [loading, setLoading] = React.useState(true);
  const [formVisible, setFormVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  const [currentId, setCurrentId] = React.useState();

  const isRecurringDeprecated = item => !item.email || !item.taskTemplateId || !item.portfolioName;

  const columnDef = [
    {
      title: 'Task Template',
      dataIndex: 'taskTemplateName',
      render: (text, record) => record.taskTemplateName ? <Link to={`/task_template/${record.taskTemplateId}`}>{text}</Link> : <Text type="danger">deleted task template</Text>,
      ellipsis: false
    },
    {
      title: 'Portfolio',
      dataIndex: 'portfolioName',
      onFilter: (value, record) => record.agentId === value,
      render: (text, record) => record.portfolioName ? <>
        <Space>
          <div direction="vertical" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            {text}
            <Text type="secondary"><small>{record.email || <Text type="danger">deleted user</Text>}</small></Text>
          </div>
        </Space>
      </> : <Text type="danger">deleted portfolio</Text>
    },
    {
      title: 'Name Template',
      dataIndex: 'nameTemplate',
      render: (text) => text,
      ellipsis: false
    },
    {
      title: 'Due Day',
      dataIndex: 'dueDay',
      render: (text) => text,
    },
    {
      title: 'Frequency',
      render: (text, record) => {
        const { every, period } = record;
        return <Text>{every} {period}{every === 1 ? null : 's'}</Text>;
      }
    },
    {
      title: 'Schedule',
      render: (text, record) => {
        const deprecated = isRecurringDeprecated(record);
        const { startFrom, every, period, lastRunAt, nextRunAt } = record;
        return <StylePatternTable>
          <tbody>
            {startFrom && <tr>
              <td className="label">
                <small>Start From</small>
              </td>
              <td>
                <TimeAgo value={startFrom} direction="horizontal" />
              </td>
            </tr>}
            <tr>
              <td className="label">
                <small>Last Run</small>
              </td>
              <td>
                {!lastRunAt ? <Text type="secondary"><DashOutlined /></Text> : <TimeAgo value={lastRunAt} direction="horizontal" />}
              </td>
            </tr>
            <tr>
              <td className="label">
                <small>Next Run</small>
              </td>
              <td>
                {deprecated || !nextRunAt ? <Text type="secondary"><DashOutlined /></Text> : <TimeAgo value={nextRunAt} direction="horizontal" />}
              </td>
            </tr>
          </tbody>
        </StylePatternTable>;
      }
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      render: (value) => <TimeAgo value={value} />
    },
    {
      // title: 'Action',
      // fixed: 'right',
      // width: 200,
      render: (text, record) => {
        const deprecated = isRecurringDeprecated(record);
        return (
          <Space size="small" style={{ width: '100%', justifyContent: 'flex-end' }}>
            {!deprecated && <Tooltip placement="bottom" title="Edit recurring"><Button type="link" icon={<EditOutlined />} onClick={e => handleEditRecurring(e, record)} /></Tooltip>}
            {!deprecated && <Tooltip placement="bottom" title="Run immediately"><Button type="link" icon={<CaretRightFilled />} onClick={e => handleRunRecurring(e, record)} /></Tooltip>}
            <Tooltip placement="bottom" title="Delete recurring"><Button type="link" danger icon={<DeleteOutlined />} onClick={e => handleDelete(e, record)} /></Tooltip>
          </Space>
        )
      },
    },
  ];

  const loadList = async () => {
    try {
      setLoading(true);
      const list = await listRecurring();
      ReactDom.unstable_batchedUpdates(() => {
        setList(list);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadList();
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
    const { id, taskTemplateName, portfolioName } = item;
    Modal.confirm({
      title: <>Delete Recurring <strong>{taskTemplateName}</strong> for <strong>{portfolioName}</strong>?</>,
      onOk: async () => {
        setLoading(true);
        await deleteRecurring(id);
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

  const handleRunRecurring = async (e, item) => {
    e.stopPropagation();
    const { id } = item;
    const task = await runRecurring(id);
    const notice = notify.success(
      'Successfully run the recurring',
      <Text>The task <TextLink strong onClick={() => {
        notice.close();
        props.history.push(`/tasks/${task.id}/proceed`);
      }}>{task.name}</TextLink> was created</Text>,
      15
    );
  }

  const handleEditOnOk = async () => {
    await loadList();
    setFormVisible(false);
  }

  return (
    <LayoutStyled>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleCreateNew()}>New Scheduler</Button>
        </Space>

        <Table columns={columnDef}
          dataSource={list}
          size="small"
          scroll={{
            x: 'max-content'
          }}
          rowKey="id"
          loading={loading}
          pagination={false}
          // pagination={queryInfo}
          // onChange={handleTableChange}
          onRow={(record) => ({
            onDoubleClick: () => {
              setCurrentId(record.id);
              setFormVisible(true);
            }
          })}
        />
      </Space>

      <StyledDrawer
        title={currentId ? 'Edit Recurring' : 'New Recurring'}
        placement="right"
        closable={true}
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        destroyOnClose={true}
        width={420}
        // bodyStyle={{ padding: '0 10px' }}
        footer={null}
      >
        <RecurringForm id={currentId} onOk={() => handleEditOnOk()} />
      </StyledDrawer>
    </LayoutStyled >

  );
};

RecurringListPage.propTypes = {};

RecurringListPage.defaultProps = {};

export default withRouter(RecurringListPage);
