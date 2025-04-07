import { Button } from 'antd';
import React from 'react';
import { useLocalstorageState } from 'rooks';
import { TaskSearchPanel } from './TaskSearchPanel';
import { useAssertRole } from 'hooks/useAssertRole';
import { Drawer } from 'antd';
import { DebugJsonPanel } from 'components/DebugJsonPanel';


export const TaskSearchDrawer = (props) => {
  useAssertRole(['admin', 'agent']);
  const { onSearch, open, onClose, queryInfo: propQueryInfo } = props;
  const [queryInfo, setQueryInfo] = React.useState(propQueryInfo);

  const handleFilterSearch = newQueryInfo => {
    setQueryInfo(newQueryInfo);
  }

  const handleSearch = () => {
    onSearch(queryInfo);
    onClose();
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Task Filter"
      destroyOnClose
      placement='right'
      footer={<Button type="primary" onClick={handleSearch}>Search</Button>}
    >
      <TaskSearchPanel queryInfo={queryInfo} onChange={handleFilterSearch} />
    </Drawer>
  )
}

TaskSearchDrawer.propTypes = {};

TaskSearchDrawer.defaultProps = {};
