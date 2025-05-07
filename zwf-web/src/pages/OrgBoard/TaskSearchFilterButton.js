import React from 'react';
import { useLocalstorageState } from 'rooks';
import { TaskSearchPanel } from './TaskSearchPanel';
import { useAssertRole } from 'hooks/useAssertRole';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { Space, Badge, Button, Modal } from 'antd';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import pick from 'lodash/pick';
import { CloseOutlined, FilterFilled, FilterOutlined } from '@ant-design/icons';


export const TaskSearchFilterButton = (props) => {
  useAssertRole(['admin', 'agent']);
  const { value, onChange, defaultQuery, showArchived, showStatusFilter } = props;
  const [modal, contextHolder] = Modal.useModal();
  const formRef = React.useRef();


  const handleOpenFilter = () => {
    const handleSearch = (newQueryInfo) => {
      onChange(newQueryInfo);
      instance.destroy();
    }

    const instance = modal.info({
      icon: <FilterFilled />,
      title: 'Search filter',
      content: <TaskSearchPanel
        ref={formRef}
        queryInfo={value}
        showStatusFilter={showStatusFilter}
        showArchived={showArchived}
        onSearch={handleSearch} />,
      okText: 'Search',
      destroyOnClose: true,
      maskClosable: true,
      closable: true,
      footer: null,
    });
  }


  const handleResetFilter = () => {
    onChange(defaultQuery);
  }

  const hasChange = () => {
    const props = ['status', 'text', 'tags', 'assigneeId', 'clientId', 'watchedOnly'];
    const v = pick(value, props);
    const d = pick(defaultQuery, props);
    return !isEqual(v, d);
  }


  return <Space>
    {/* <DebugJsonPanel value={queryInfo} /> */}
    {/* <DebugJsonPanel value={defaultQuery} /> */}
    <Button key="clear"
      // type="text"
      icon={<CloseOutlined/>}
      onClick={handleResetFilter}>Reset</Button>
    <Badge showZero={false} count={hasChange() ? ' ' : 0} size="small">
      <Button icon={<FilterFilled />} onClick={handleOpenFilter}>Filter</Button>
      {contextHolder}
    </Badge>
  </Space>
}

TaskSearchFilterButton.propTypes = {
  storeKey: PropTypes.string,
  defaultQuery: PropTypes.object,
  value: PropTypes.object,
  onChange: PropTypes.func,
  showArchived: PropTypes.bool,
};

TaskSearchFilterButton.defaultProps = {
  storeKey: 'tasks.filter',
  defaultQuery: {},
  onChange: () => { },
  showArchived: false,
};
