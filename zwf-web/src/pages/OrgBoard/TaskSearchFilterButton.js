import React from 'react';
import { useLocalstorageState } from 'rooks';
import { TaskSearchPanel } from './TaskSearchPanel';
import { useAssertRole } from 'hooks/useAssertRole';
import { DebugJsonPanel } from 'components/DebugJsonPanel';
import { Badge, Button, Modal } from 'antd';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';


export const TaskSearchFilterButton = (props) => {
  useAssertRole(['admin', 'agent']);
  const { onChange, storeKey, defaultQuery } = props;
  const [modal, contextHolder] = Modal.useModal();
  const [stored, setStored] = useLocalstorageState(storeKey, defaultQuery);
  const [queryInfo, setQueryInfo] = React.useState(stored);
  const formRef = React.useRef();

  
  const handleOpenFilter = () => {
    const handleSearch = (newQueryInfo) => {
      setStored(newQueryInfo);
      setQueryInfo(newQueryInfo);
      onChange(newQueryInfo);
      instance.destroy();
    }

    const instance = modal.info({
      icon: <FilterFilled />,
      title: 'Search filter',
      content: <TaskSearchPanel
        ref={formRef}
        queryInfo={queryInfo}
        defaultQuery={defaultQuery}
        onSearch={handleSearch} />,
      okText: 'Search',
      destroyOnClose: true,
      maskClosable: true,
      closable: true,
      footer: null,
    });
  }

  return <Badge showZero={false} count={isEqual(queryInfo, defaultQuery) ? 0 : ' '} size="small">
    {/* <DebugJsonPanel value={queryInfo} /> */}
    {/* <DebugJsonPanel value={defaultQuery} /> */}
    <Button icon={<FilterFilled />} onClick={handleOpenFilter}>Filter</Button>
    {contextHolder}
  </Badge>
}

TaskSearchFilterButton.propTypes = {
  storeKey: PropTypes.string,
  defaultQuery: PropTypes.object,
  onChange: PropTypes.func,
};

TaskSearchFilterButton.defaultProps = {
  storeKey: 'tasks.filter',
  defaultQuery: {},
  onChange: () => { },
};
